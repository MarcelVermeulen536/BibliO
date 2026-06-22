# BiblioTheque

Application **desktop** de gestion d'une bibliotheque personnelle : on catalogue ses
livres (CRUD complet), on les classe par genre, on gere auteurs / editeurs et on suit
les emprunts. Quelques statistiques sont calculees directement depuis la base.

Projet realise pour le cours de **projet de developpement SGBD** (M. Wattiaux).

## Stack technique

| Couche | Technologie |
|---|---|
| Application desktop | **Electron** (architecture main / preload / renderer) |
| Backend / persistance | **Node.js** + **Prisma** (ORM) |
| Base de donnees | **SQLite** local (fichier `prisma/dev.db`) |
| Interface (renderer) | **Angular 21** (standalone, signals, routing) |

## Prerequis

- **Node.js >= 18** (teste avec Node 24)
- **npm**

## Installation

```bash
# 1. Installer les dependances Electron / Prisma (genere aussi le client Prisma)
npm install

# 2. Installer les dependances Angular (le renderer a son propre package.json)
cd renderer/app
npm install
cd ../..
```

## Lancement

```bash
npm run start
```

Cette commande enchaine automatiquement :

1. `build:main`  — compile le main process et le preload TypeScript (`src/` -> `dist/`)
2. `db:deploy`   — applique la migration SQLite (cree `prisma/dev.db` au besoin)
3. `seed`        — insere des donnees de test (ignore si la base contient deja des livres)
4. `build:angular` — compile l'app Angular (`ng build`)
5. `electron .` — lance l'application desktop

> L'app charge le **build statique** d'Angular via `loadFile` (pas de serveur `localhost:4200`).

## Scripts npm

| Script | Role |
|---|---|
| `npm run start` | Build complet + lancement de l'application |
| `npm run build:main` | Compile `src/` (main + preload + repository) vers `dist/` |
| `npm run build:angular` | Compile le renderer Angular |
| `npm run prisma:migrate` | Cree / applique une migration (developpement) |
| `npm run db:deploy` | Applique les migrations existantes |
| `npm run seed` | Insere les donnees de test |
| `npm run prisma:studio` *(via npx)* | `npx prisma studio` pour explorer la base |

## Architecture et flux de donnees

Le renderer Angular ne touche **jamais** la base de donnees directement. Il passe
toujours par le pont securise (preload) puis par le main process :

```
Composant Angular (livres / statistiques)
      v   appel de methode
LivreService            (logique metier, cote Angular)
      v
ElectronService         (seul a connaitre window.api)
      v   window.api.xxx()
preload.ts              (contextBridge -> ipcRenderer.invoke)
      v   IPC
main.ts                 (ipcMain.handle, un try/catch par canal)
      v
livre.repository.ts     (toutes les requetes Prisma)
      v
Prisma  ->  SQLite (prisma/dev.db)
```

## Structure du projet

```
.
├── src/                          # Main process (Electron + Node.js)
│   ├── main.ts                   # Fenetre + handlers IPC
│   ├── preload.ts                # Pont securise contextBridge -> window.api
│   ├── seed.ts                   # Script de peuplement de la base
│   └── repository/
│       └── livre.repository.ts   # Toutes les requetes Prisma (pattern Repository)
├── renderer/app/                 # Application Angular (renderer)
│   └── src/app/
│       ├── app.ts / app.html     # Composant racine : navigation + router-outlet
│       ├── app.routes.ts         # 2 routes : /livres et /statistiques
│       ├── types/electron.ts     # Types partages + declaration de window.api
│       ├── services/
│       │   ├── electron.service.ts   # Acces a window.api
│       │   └── livre.service.ts       # Appels IPC via ElectronService
│       ├── component/livre-item/      # Affichage d'un livre (input / output)
│       └── pages/
│           ├── livres/                # CRUD des livres (formulaire reactif)
│           └── statistiques/          # Agregats (comptages par genre)
├── prisma/
│   ├── schema.prisma             # Les 7 modeles de la base
│   └── migrations/               # Migration SQL versionnee
├── docs/schema.md                # Schema de la base (diagramme ER)
├── .env                          # DATABASE_URL (chemin SQLite local)
├── package.json
└── tsconfig.json
```

## Fonctionnalites (CRUD sur les livres)

- **Creer** un livre (titre, annee, resume, statut, auteur, editeur, genres)
- **Lire** la liste des livres avec leur auteur, editeur et genres
- **Modifier** un livre existant
- **Supprimer** un livre

Page **Statistiques** : nombre total de livres, livres empruntes, et nombre de livres
par genre (agregats calcules par Prisma).

## Modele de donnees

7 modeles : `Auteur`, `Editeur`, `Genre`, `Livre`, `LivreGenre` (jonction), `Membre`,
`Emprunt`. Relations : 1:N (Auteur/Editeur -> Livre, Membre/Livre -> Emprunt) et N:M
(Livre <-> Genre via `LivreGenre`). Voir [docs/schema.md](docs/schema.md).

## Remarque sur le fichier `.env`

En regle generale `.env` est ignore par git. Ici il ne contient qu'un chemin SQLite
local (aucun secret) et est commite pour que le projet se lance directement apres clone.
