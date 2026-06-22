import { Injectable, inject } from '@angular/core';
import { ElectronService } from './electron.service';
import {
  Auteur,
  Editeur,
  Genre,
  Livre,
  LivreInput,
  Statistiques,
} from '../types/electron';

// Logique metier de la bibliotheque : delegue les appels IPC a ElectronService.
// Les composants n'appellent jamais window.api directement, ils passent par ce service.
@Injectable({ providedIn: 'root' })
export class LivreService {
  private electron = inject(ElectronService);

  // CRUD sur le livre
  getLivres(): Promise<Livre[]> {
    return this.electron.getApi().getLivres();
  }

  createLivre(input: LivreInput): Promise<Livre> {
    return this.electron.getApi().createLivre(input);
  }

  updateLivre(id: number, input: LivreInput): Promise<Livre> {
    return this.electron.getApi().updateLivre(id, input);
  }

  deleteLivre(id: number): Promise<Livre> {
    return this.electron.getApi().deleteLivre(id);
  }

  // Donnees de support (pour le formulaire)
  getAuteurs(): Promise<Auteur[]> {
    return this.electron.getApi().getAuteurs();
  }

  getEditeurs(): Promise<Editeur[]> {
    return this.electron.getApi().getEditeurs();
  }

  getGenres(): Promise<Genre[]> {
    return this.electron.getApi().getGenres();
  }

  // Statistiques (agregats)
  getStatistiques(): Promise<Statistiques> {
    return this.electron.getApi().getStatistiques();
  }
}
