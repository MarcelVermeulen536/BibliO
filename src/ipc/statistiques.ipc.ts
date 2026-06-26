// Handler IPC pour les statistiques (agregats count / _count).
// Importe dans main.ts qui appelle enregistrerHandlersStatistiques().
import { ipcMain } from 'electron';
import * as repo from '../repository/livre.repository';

export function enregistrerHandlersStatistiques(): void {
  ipcMain.handle('stats:get', () => repo.getStatistiques());
}
