import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { LivreService } from '../../services/livre.service';
import { Statistiques as StatsData } from '../../types/electron';

// Page Statistiques : affiche des agregats calcules cote base (count / _count).
@Component({
  selector: 'app-statistiques',
  imports: [],
  templateUrl: './statistiques.html',
  styleUrl: './statistiques.css',
})
export class Statistiques implements OnInit {
  private livreService = inject(LivreService);

  stats = signal<StatsData | null>(null);

  // Signal derive : le plus grand nombre de livres d'un genre (pour les barres).
  maxParGenre = computed(() => {
    const s = this.stats();
    if (!s || s.parGenre.length === 0) {
      return 0;
    }
    return Math.max(...s.parGenre.map((g) => g.nbLivres));
  });

  async ngOnInit(): Promise<void> {
    this.stats.set(await this.livreService.getStatistiques());
  }

  // Largeur (%) d'une barre par rapport au genre le plus fourni.
  largeurBarre(nb: number): number {
    const max = this.maxParGenre();
    return max === 0 ? 0 : Math.round((nb / max) * 100);
  }
}
