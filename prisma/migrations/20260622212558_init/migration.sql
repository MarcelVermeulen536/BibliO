-- CreateTable
CREATE TABLE "Auteur" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nom" TEXT NOT NULL,
    "prenom" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Editeur" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nom" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Genre" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nom" TEXT NOT NULL,
    "couleur" TEXT NOT NULL DEFAULT '#cccccc'
);

-- CreateTable
CREATE TABLE "Livre" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "titre" TEXT NOT NULL,
    "annee" INTEGER,
    "resume" TEXT,
    -- CHECK ajoute a la main : Prisma ne genere pas les contraintes CHECK (vu en seance 7).
    "statut" TEXT NOT NULL DEFAULT 'DISPONIBLE' CHECK ("statut" IN ('DISPONIBLE', 'EMPRUNTE', 'PERDU')),
    "auteurId" INTEGER NOT NULL,
    "editeurId" INTEGER,
    CONSTRAINT "Livre_auteurId_fkey" FOREIGN KEY ("auteurId") REFERENCES "Auteur" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Livre_editeurId_fkey" FOREIGN KEY ("editeurId") REFERENCES "Editeur" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "LivreGenre" (
    "livreId" INTEGER NOT NULL,
    "genreId" INTEGER NOT NULL,

    PRIMARY KEY ("livreId", "genreId"),
    CONSTRAINT "LivreGenre_livreId_fkey" FOREIGN KEY ("livreId") REFERENCES "Livre" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "LivreGenre_genreId_fkey" FOREIGN KEY ("genreId") REFERENCES "Genre" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Membre" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nom" TEXT NOT NULL,
    "email" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Emprunt" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "dateEmprunt" TEXT NOT NULL,
    "dateRetour" TEXT,
    "livreId" INTEGER NOT NULL,
    "membreId" INTEGER NOT NULL,
    CONSTRAINT "Emprunt_livreId_fkey" FOREIGN KEY ("livreId") REFERENCES "Livre" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Emprunt_membreId_fkey" FOREIGN KEY ("membreId") REFERENCES "Membre" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Editeur_nom_key" ON "Editeur"("nom");

-- CreateIndex
CREATE UNIQUE INDEX "Genre_nom_key" ON "Genre"("nom");

-- CreateIndex
CREATE UNIQUE INDEX "Membre_email_key" ON "Membre"("email");
