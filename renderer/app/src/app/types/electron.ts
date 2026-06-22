// Types partages cote Angular : ils decrivent les donnees echangees avec Electron.
// Ce fichier declare aussi window.api pour que TypeScript le connaisse.

export type Statut = 'DISPONIBLE' | 'EMPRUNTE' | 'PERDU';

export interface Auteur {
  id: number;
  nom: string;
  prenom: string;
}

export interface Editeur {
  id: number;
  nom: string;
}

export interface Genre {
  id: number;
  nom: string;
  couleur: string;
}

// Lien charge avec un livre : chaque entree de la table de jonction porte son genre.
export interface LienGenre {
  genre: Genre;
}

// Un livre tel que renvoye par le main (avec ses relations chargees via include).
export interface Livre {
  id: number;
  titre: string;
  annee: number | null;
  resume: string | null;
  statut: Statut;
  auteurId: number;
  editeurId: number | null;
  auteur: Auteur;
  editeur: Editeur | null;
  genres: LienGenre[];
}

// Donnees envoyees au main pour creer/modifier un livre.
export interface LivreInput {
  titre: string;
  annee: number | null;
  resume: string | null;
  statut: Statut;
  auteurId: number;
  editeurId: number | null;
  genreIds: number[];
}

// Une ligne de statistique : un genre et son nombre de livres.
export interface StatGenre {
  nom: string;
  couleur: string;
  nbLivres: number;
}

export interface Statistiques {
  totalLivres: number;
  totalEmpruntes: number;
  parGenre: StatGenre[];
}

// L'API exposee par le preload (window.api).
export interface BiblioApi {
  getLivres: () => Promise<Livre[]>;
  createLivre: (input: LivreInput) => Promise<Livre>;
  updateLivre: (id: number, input: LivreInput) => Promise<Livre>;
  deleteLivre: (id: number) => Promise<Livre>;
  getAuteurs: () => Promise<Auteur[]>;
  getEditeurs: () => Promise<Editeur[]>;
  getGenres: () => Promise<Genre[]>;
  getStatistiques: () => Promise<Statistiques>;
}

// On "augmente" l'interface Window pour y ajouter notre propriete api.
declare global {
  interface Window {
    api: BiblioApi;
  }
}
