// Handlers IPC pour les donnees de support du formulaire : auteurs, editeurs, genres.
// Importe dans main.ts qui appelle enregistrerHandlersCatalogue().
import { ipcMain } from 'electron';
import * as repo from '../repository/livre.repository';

export function enregistrerHandlersCatalogue(): void {
  ipcMain.handle('auteur:getAll', () => repo.getAuteurs());
  ipcMain.handle('editeur:getAll', () => repo.getEditeurs());
  ipcMain.handle('genre:getAll', () => repo.getGenres());
}
