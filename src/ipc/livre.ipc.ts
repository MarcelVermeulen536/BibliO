// Handlers IPC pour les livres (CRUD).
// Ce fichier est importe dans main.ts qui appelle enregistrerHandlersLivre().
import { ipcMain } from 'electron';
import * as repo from '../repository/livre.repository';
import { LivreInput } from '../repository/livre.repository';

// Enregistre les canaux IPC lies aux livres. Chaque handler delègue au repository.
export function enregistrerHandlersLivre(): void {
  ipcMain.handle('livre:getAll', () => repo.getLivres());
  ipcMain.handle('livre:create', (_event, input: LivreInput) => repo.createLivre(input));
  ipcMain.handle('livre:update', (_event, id: number, input: LivreInput) => repo.updateLivre(id, input));
  ipcMain.handle('livre:delete', (_event, id: number) => repo.deleteLivre(id));
}
