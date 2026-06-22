import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { LivreService } from '../../services/livre.service';
import { LivreItem } from '../../component/livre-item/livre-item';
import {
  Auteur,
  Editeur,
  Genre,
  Livre,
  LivreInput,
  Statut,
} from '../../types/electron';

// Page principale : liste des livres + formulaire de creation / modification.
@Component({
  selector: 'app-livres',
  imports: [ReactiveFormsModule, LivreItem],
  templateUrl: './livres.html',
  styleUrl: './livres.css',
})
export class Livres implements OnInit {
  private livreService = inject(LivreService);
  private fb = inject(FormBuilder);

  // Etat reactif (signals)
  livres = signal<Livre[]>([]);
  auteurs = signal<Auteur[]>([]);
  editeurs = signal<Editeur[]>([]);
  genres = signal<Genre[]>([]);
  genresSelectionnes = signal<number[]>([]); // genres coches dans le formulaire
  editionId = signal<number | null>(null); // null = creation, sinon id du livre modifie
  erreur = signal<string>('');

  // Signal derive : nombre de livres affiches.
  nombreLivres = computed(() => this.livres().length);

  // Formulaire reactif (ReactiveFormsModule).
  form = this.fb.group({
    titre: ['', Validators.required],
    annee: [null as number | null],
    resume: [''],
    statut: ['DISPONIBLE' as Statut, Validators.required],
    auteurId: [null as number | null, Validators.required],
    editeurId: [null as number | null],
  });

  ngOnInit(): void {
    this.chargerTout();
  }

  // Charge toutes les donnees necessaires a la page.
  async chargerTout(): Promise<void> {
    try {
      this.livres.set(await this.livreService.getLivres());
      this.auteurs.set(await this.livreService.getAuteurs());
      this.editeurs.set(await this.livreService.getEditeurs());
      this.genres.set(await this.livreService.getGenres());
    } catch {
      this.erreur.set('Impossible de charger les donnees.');
    }
  }

  // Coche / decoche un genre dans la selection.
  toggleGenre(id: number): void {
    const selection = this.genresSelectionnes();
    this.genresSelectionnes.set(
      selection.includes(id)
        ? selection.filter((g) => g !== id)
        : [...selection, id]
    );
  }

  estSelectionne(id: number): boolean {
    return this.genresSelectionnes().includes(id);
  }

  // Enregistre : creation si editionId est null, sinon modification.
  async enregistrer(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const valeurs = this.form.getRawValue();
    const input: LivreInput = {
      titre: valeurs.titre!.trim(),
      annee: valeurs.annee ? Number(valeurs.annee) : null,
      resume: valeurs.resume?.trim() ? valeurs.resume.trim() : null,
      statut: valeurs.statut!,
      auteurId: Number(valeurs.auteurId),
      editeurId: valeurs.editeurId ? Number(valeurs.editeurId) : null,
      genreIds: this.genresSelectionnes(),
    };

    try {
      if (this.editionId() === null) {
        await this.livreService.createLivre(input);
      } else {
        await this.livreService.updateLivre(this.editionId()!, input);
      }
      this.annuler();
      await this.chargerTout();
    } catch {
      this.erreur.set("Erreur lors de l'enregistrement du livre.");
    }
  }

  // Pre-remplit le formulaire avec un livre existant (mode modification).
  commencerModification(livre: Livre): void {
    this.editionId.set(livre.id);
    this.erreur.set('');
    this.form.patchValue({
      titre: livre.titre,
      annee: livre.annee,
      resume: livre.resume ?? '',
      statut: livre.statut,
      auteurId: livre.auteurId,
      editeurId: livre.editeurId,
    });
    this.genresSelectionnes.set(livre.genres.map((lien) => lien.genre.id));
  }

  // Reinitialise le formulaire (annule la modification en cours).
  annuler(): void {
    this.editionId.set(null);
    this.genresSelectionnes.set([]);
    this.erreur.set('');
    this.form.reset({ statut: 'DISPONIBLE' });
  }

  // Supprime un livre puis recharge la liste.
  async supprimer(id: number): Promise<void> {
    try {
      await this.livreService.deleteLivre(id);
      await this.chargerTout();
    } catch {
      this.erreur.set('Suppression impossible.');
    }
  }
}
