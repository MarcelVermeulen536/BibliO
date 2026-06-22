import { Routes } from '@angular/router';
import { Livres } from './pages/livres/livres';
import { Statistiques } from './pages/statistiques/statistiques';

// Deux pages routees : la gestion des livres et les statistiques.
export const routes: Routes = [
  { path: '', redirectTo: 'livres', pathMatch: 'full' },
  { path: 'livres', component: Livres },
  { path: 'statistiques', component: Statistiques },
];
