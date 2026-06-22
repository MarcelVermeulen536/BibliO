import { Injectable } from '@angular/core';
import { BiblioApi } from '../types/electron';

// Seul service qui touche a window.api. Tout le reste passe par lui.
// Service singleton : une seule instance partagee dans toute l'app.
@Injectable({ providedIn: 'root' })
export class ElectronService {
  // Verifie qu'on tourne bien dans Electron (et pas dans un navigateur).
  isElectron(): boolean {
    return !!(window && window.api);
  }

  // Retourne window.api typee, ou leve une erreur explicite si absente.
  getApi(): BiblioApi {
    if (!this.isElectron()) {
      throw new Error(
        "window.api introuvable - l'application doit etre lancee dans Electron."
      );
    }
    return window.api;
  }
}
