// Repository : centralise TOUTES les requetes Prisma de l'application.
// Le main process appelle ces fonctions ; il ne contient aucun SQL lui-meme.
import { PrismaClient, Statut } from '@prisma/client';
import * as path from 'path';

// La base SQLite se trouve dans prisma/dev.db, a la racine du projet.
// A l'execution ce fichier est dans dist/repository/ -> on remonte de deux crans.
// On construit un chemin absolu (slashes "/") pour que l'app fonctionne quel que soit
// le dossier de lancement, sous Windows comme ailleurs.
const cheminDb = path.join(__dirname, '..', '..', 'prisma', 'dev.db').replace(/\\/g, '/');

// Une seule instance de PrismaClient pour toute l'app (pattern singleton, vu en cours).
// On passe l'URL directement au constructeur (chemin absolu fiable).
export const prisma = new PrismaClient({
  datasources: { db: { url: 'file:' + cheminDb } },
});

// Relations a charger avec un livre (equivalent d'un JOIN via include).
const livreAvecRelations = {
  auteur: true,
  editeur: true,
  genres: { include: { genre: true } },
};

// Donnees envoyees par le formulaire Angular pour creer/modifier un livre.
export interface LivreInput {
  titre: string;
  annee: number | null;
  resume: string | null;
  statut: Statut;
  auteurId: number;
  editeurId: number | null;
  genreIds: number[];
}

// Valide que le statut recu fait bien partie des valeurs autorisees.
function verifierStatut(statut: string): Statut {
  if (statut !== 'DISPONIBLE' && statut !== 'EMPRUNTE' && statut !== 'PERDU') {
    throw new Error(`Statut invalide : ${statut}`);
  }
  return statut as Statut;
}

// ---- CRUD sur le livre (l'entite principale) ----

// READ : tous les livres avec leur auteur, editeur et genres, tries par titre.
export function getLivres() {
  return prisma.livre.findMany({
    include: livreAvecRelations,
    orderBy: { titre: 'asc' },
  });
}

// CREATE : cree un livre et ses liens vers les genres (relation N:M).
// On utilise une TRANSACTION : le livre ET ses liens genres sont ecrits ensemble.
// Si une etape echoue, tout est annule (rien n'est enregistre).
// Syntaxe interactive async (tx) car la 2e ecriture depend de l'id cree par la 1re.
export async function createLivre(input: LivreInput) {
  try {
    return await prisma.$transaction(async (tx) => {
      // 1. on cree le livre
      const livre = await tx.livre.create({
        data: {
          titre: input.titre,
          annee: input.annee,
          resume: input.resume,
          statut: verifierStatut(input.statut),
          auteurId: input.auteurId,
          editeurId: input.editeurId,
        },
      });

      // 2. on cree ses liens vers les genres (table de jonction) avec l'id du livre
      for (const genreId of input.genreIds) {
        await tx.livreGenre.create({ data: { livreId: livre.id, genreId } });
      }

      // 3. on renvoie le livre complet (avec auteur, editeur et genres)
      return tx.livre.findUniqueOrThrow({
        where: { id: livre.id },
        include: livreAvecRelations,
      });
    });
  } catch (e) {
    console.error('Erreur createLivre :', e);
    throw e; // on relance pour que le renderer puisse afficher l'erreur
  }
}

// UPDATE : modifie un livre ; on remplace ses genres (on efface puis on recree les liens).
export async function updateLivre(id: number, input: LivreInput) {
  try {
    return await prisma.livre.update({
      where: { id },
      data: {
        titre: input.titre,
        annee: input.annee,
        resume: input.resume,
        statut: verifierStatut(input.statut),
        auteurId: input.auteurId,
        editeurId: input.editeurId,
        genres: {
          deleteMany: {},
          create: input.genreIds.map((genreId) => ({ genreId })),
        },
      },
      include: livreAvecRelations,
    });
  } catch (e) {
    console.error('Erreur updateLivre :', e);
    throw e;
  }
}

// DELETE : supprime un livre (ses liens genres et emprunts partent en cascade).
export async function deleteLivre(id: number) {
  try {
    return await prisma.livre.delete({ where: { id } });
  } catch (e) {
    console.error('Erreur deleteLivre :', e);
    throw e;
  }
}

// ---- Donnees de support pour remplir le formulaire ----

export function getAuteurs() {
  return prisma.auteur.findMany({ orderBy: { nom: 'asc' } });
}

export function getEditeurs() {
  return prisma.editeur.findMany({ orderBy: { nom: 'asc' } });
}

export function getGenres() {
  return prisma.genre.findMany({ orderBy: { nom: 'asc' } });
}

// ---- Agregats / comptages affiches dans la page Statistiques ----
export async function getStatistiques() {
  const totalLivres = await prisma.livre.count();
  const totalEmpruntes = await prisma.livre.count({ where: { statut: 'EMPRUNTE' } });

  // _count : compte le nombre de livres lies a chaque genre (agregat Prisma).
  const genres = await prisma.genre.findMany({
    include: { _count: { select: { livres: true } } },
    orderBy: { nom: 'asc' },
  });

  const parGenre = genres.map((g) => ({
    nom: g.nom,
    couleur: g.couleur,
    nbLivres: g._count.livres,
  }));

  return { totalLivres, totalEmpruntes, parGenre };
}

// Ferme proprement la connexion a la base (appelee a la fermeture de l'app).
export async function fermerConnexion(): Promise<void> {
  await prisma.$disconnect();
}
