// Main process Electron : cree la fenetre et enregistre les handlers IPC.
// Les handlers sont volontairement minces : ils delèguent au repository,
// qui contient toute la logique Prisma et la gestion des erreurs.
import { app, BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';
import * as repo from './repository/livre.repository';
import { LivreInput } from './repository/livre.repository';

// Cree la fenetre principale et y charge l'app Angular buildee.
function createWindow(): void {
  const win = new BrowserWindow({
    width: 1100,
    height: 720,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'), // le pont securise
      contextIsolation: true, // isole le contexte JS du renderer
      nodeIntegration: false, // le renderer n'a pas acces a Node.js
    },
  });

  // On charge le build statique d'Angular (ng build), pas un serveur localhost.
  win.loadFile(
    path.join(__dirname, '..', 'renderer/app/dist/app/browser/index.html')
  );
}

app.whenReady().then(createWindow);

// Sur Windows/Linux, fermer toutes les fenetres quitte l'application.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// Ferme proprement la connexion Prisma a la fermeture de l'app.
app.on('before-quit', async () => {
  await repo.fermerConnexion();
});

// ---- Handlers IPC ----
// Chaque canal delègue simplement au repository (pas de logique ici).
ipcMain.handle('livre:getAll', () => repo.getLivres());
ipcMain.handle('livre:create', (_event, input: LivreInput) => repo.createLivre(input));
ipcMain.handle('livre:update', (_event, id: number, input: LivreInput) => repo.updateLivre(id, input));
ipcMain.handle('livre:delete', (_event, id: number) => repo.deleteLivre(id));

ipcMain.handle('auteur:getAll', () => repo.getAuteurs());
ipcMain.handle('editeur:getAll', () => repo.getEditeurs());
ipcMain.handle('genre:getAll', () => repo.getGenres());

ipcMain.handle('stats:get', () => repo.getStatistiques());
