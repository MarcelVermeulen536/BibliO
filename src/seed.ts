// Script de peuplement (seed) : insere des donnees de test dans la base.
// Idempotent : si des livres existent deja, il ne fait rien (pas de doublons).
import { prisma } from './repository/livre.repository';

async function main(): Promise<void> {
  const dejaRempli = await prisma.livre.count();
  if (dejaRempli > 0) {
    console.log('Donnees deja presentes -> seed ignore.');
    return;
  }

  // --- Genres (relation N:M avec les livres) ---
  const roman = await prisma.genre.create({ data: { nom: 'Roman', couleur: '#e74c3c' } });
  const sf = await prisma.genre.create({ data: { nom: 'Science-Fiction', couleur: '#3498db' } });
  const policier = await prisma.genre.create({ data: { nom: 'Policier', couleur: '#2c3e50' } });
  const histoire = await prisma.genre.create({ data: { nom: 'Histoire', couleur: '#f39c12' } });

  // --- Editeurs (relation 1:N vers les livres) ---
  const gallimard = await prisma.editeur.create({ data: { nom: 'Gallimard' } });
  const penguin = await prisma.editeur.create({ data: { nom: 'Penguin Books' } });

  // --- Auteurs (relation 1:N vers les livres) ---
  const saintEx = await prisma.auteur.create({ data: { nom: 'Saint-Exupery', prenom: 'Antoine' } });
  const orwell = await prisma.auteur.create({ data: { nom: 'Orwell', prenom: 'George' } });
  const herbert = await prisma.auteur.create({ data: { nom: 'Herbert', prenom: 'Frank' } });
  const harari = await prisma.auteur.create({ data: { nom: 'Harari', prenom: 'Yuval Noah' } });

  // --- Livres + liens vers les genres (creation imbriquee de la table de jonction) ---
  await prisma.livre.create({
    data: {
      titre: 'Le Petit Prince',
      annee: 1943,
      resume: 'Un aviateur rencontre un petit prince venu d une autre planete.',
      statut: 'DISPONIBLE',
      auteurId: saintEx.id,
      editeurId: gallimard.id,
      genres: { create: [{ genreId: roman.id }] },
    },
  });

  const livre1984 = await prisma.livre.create({
    data: {
      titre: '1984',
      annee: 1949,
      resume: 'Une dystopie sous le regard permanent de Big Brother.',
      statut: 'EMPRUNTE',
      auteurId: orwell.id,
      editeurId: penguin.id,
      genres: { create: [{ genreId: sf.id }, { genreId: policier.id }] },
    },
  });

  await prisma.livre.create({
    data: {
      titre: 'Dune',
      annee: 1965,
      resume: 'Sur la planete desertique Arrakis, la lutte pour l epice melange.',
      statut: 'DISPONIBLE',
      auteurId: herbert.id,
      editeurId: penguin.id,
      genres: { create: [{ genreId: sf.id }] },
    },
  });

  await prisma.livre.create({
    data: {
      titre: 'Sapiens',
      annee: 2011,
      resume: 'Une breve histoire de l humanite.',
      statut: 'DISPONIBLE',
      auteurId: harari.id,
      editeurId: gallimard.id,
      genres: { create: [{ genreId: histoire.id }] },
    },
  });

  // --- Membre + emprunt (relation 1:N Membre/Livre -> Emprunt) ---
  const alice = await prisma.membre.create({
    data: { nom: 'Dupont Alice', email: 'alice@biblio.be' },
  });

  await prisma.emprunt.create({
    data: {
      dateEmprunt: '2026-06-01',
      livreId: livre1984.id,
      membreId: alice.id,
    },
  });

  console.log('Seed termine : donnees de test inserees.');
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error('Erreur pendant le seed :', e);
    await prisma.$disconnect();
    process.exit(1);
  });
