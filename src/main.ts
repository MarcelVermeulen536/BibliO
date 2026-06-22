// Main process Electron : cree la fenetre et expose les handlers IPC.
// C'est le seul endroit (avec le repository) qui touche a la base de donnees.
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
  await repo.prisma.$disconnect();
});

// ---- Handlers IPC ----
// Chaque appel Prisma est dans un try/catch (exige par les consignes).
// On logge l'erreur cote main puis on la relance : l'appel renderer est rejete
// et le service Angular peut l'attraper a son tour.

ipcMain.handle('livre:getAll', async () => {
  try {
    return await repo.getLivres();
  } catch (e) {
    console.error('Erreur livre:getAll', e);
    throw e;
  }
});

ipcMain.handle('livre:create', async (_event, input: LivreInput) => {
  try {
    return await repo.createLivre(input);
  } catch (e) {
    console.error('Erreur livre:create', e);
    throw e;
  }
});

ipcMain.handle('livre:update', async (_event, id: number, input: LivreInput) => {
  try {
    return await repo.updateLivre(id, input);
  } catch (e) {
    console.error('Erreur livre:update', e);
    throw e;
  }
});

ipcMain.handle('livre:delete', async (_event, id: number) => {
  try {
    return await repo.deleteLivre(id);
  } catch (e) {
    console.error('Erreur livre:delete', e);
    throw e;
  }
});

ipcMain.handle('auteur:getAll', async () => {
  try {
    return await repo.getAuteurs();
  } catch (e) {
    console.error('Erreur auteur:getAll', e);
    throw e;
  }
});

ipcMain.handle('editeur:getAll', async () => {
  try {
    return await repo.getEditeurs();
  } catch (e) {
    console.error('Erreur editeur:getAll', e);
    throw e;
  }
});

ipcMain.handle('genre:getAll', async () => {
  try {
    return await repo.getGenres();
  } catch (e) {
    console.error('Erreur genre:getAll', e);
    throw e;
  }
});

ipcMain.handle('stats:get', async () => {
  try {
    return await repo.getStatistiques();
  } catch (e) {
    console.error('Erreur stats:get', e);
    throw e;
  }
});
