// Main process Electron : cree la fenetre et enregistre les handlers IPC.
// Les handlers sont separes par service dans src/ipc/ ; main.ts les importe
// et les enregistre. La logique Prisma vit dans le repository.
import { app, BrowserWindow } from 'electron';
import * as path from 'path';
import * as repo from './repository/livre.repository';
import { enregistrerHandlersLivre } from './ipc/livre.ipc';
import { enregistrerHandlersCatalogue } from './ipc/catalogue.ipc';
import { enregistrerHandlersStatistiques } from './ipc/statistiques.ipc';

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

// Enregistrement des handlers IPC (separes par service dans src/ipc/).
enregistrerHandlersLivre();
enregistrerHandlersCatalogue();
enregistrerHandlersStatistiques();

app.whenReady().then(createWindow);

// Sur Windows/Linux, fermer toutes les fenetres quitte l'application.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// Ferme proprement la connexion Prisma a la fermeture de l'app.
app.on('before-quit', async () => {
  await repo.fermerConnexion();
});
