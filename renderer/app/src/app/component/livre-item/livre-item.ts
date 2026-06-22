import { Component, input, output } from '@angular/core';
import { Livre } from '../../types/electron';

// Composant d'affichage d'UN livre.
// Il recoit un livre du parent (input) et lui renvoie les actions (output).
@Component({
  selector: 'app-livre-item',
  imports: [],
  templateUrl: './livre-item.html',
  styleUrl: './livre-item.css',
})
export class LivreItem {
  // input() : le livre fourni par le composant parent.
  livre = input.required<Livre>();

  // output() : evenements remontes vers le parent.
  modifier = output<Livre>();
  supprimer = output<number>();

  onModifier(): void {
    this.modifier.emit(this.livre());
  }

  onSupprimer(): void {
    this.supprimer.emit(this.livre().id);
  }
}
