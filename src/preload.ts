// Preload : pont securise entre le renderer (Angular) et le main process.
// contextBridge expose un objet window.api ; le renderer ne voit jamais ipcRenderer.
import { contextBridge, ipcRenderer } from 'electron';
import { LivreInput } from './repository/livre.repository';

contextBridge.exposeInMainWorld('api', {
  // CRUD livre
  getLivres: () => ipcRenderer.invoke('livre:getAll'),
  createLivre: (input: LivreInput) => ipcRenderer.invoke('livre:create', input),
  updateLivre: (id: number, input: LivreInput) =>
    ipcRenderer.invoke('livre:update', id, input),
  deleteLivre: (id: number) => ipcRenderer.invoke('livre:delete', id),

  // Donnees de support (pour le formulaire)
  getAuteurs: () => ipcRenderer.invoke('auteur:getAll'),
  getEditeurs: () => ipcRenderer.invoke('editeur:getAll'),
  getGenres: () => ipcRenderer.invoke('genre:getAll'),

  // Statistiques (agregats)
  getStatistiques: () => ipcRenderer.invoke('stats:get'),
});
