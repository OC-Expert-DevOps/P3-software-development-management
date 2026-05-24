# DataShare - Prototype MVP

Prototype de plateforme de transfert sécurisé de fichiers pour freelances et PME. Ce projet constitue le MVP (Minimum Viable Product) de l'application DataShare.

## Architecture et Stack Technique

### Stack Technique Choisie
- **Backend** : NestJS (TypeScript)
- **Frontend** : React + Vite + TypeScript
- **Base de données** : PostgreSQL
- **ORM** : Prisma
- **Stockage** : Volume local (via Docker)
- **Déploiement** : Docker Compose avec Nginx (Reverse Proxy)

Pour une justification détaillée de ces choix et le diagramme complet, consultez [docs/architecture.md](docs/architecture.md).

### Modèle de données
Le schéma de la base de données est documenté ici : [docs/data-model.md](docs/data-model.md).

### Contrat d'API (OpenAPI)
L'API REST est documentée via OpenAPI 3.0. Voir les détails dans [docs/api/README.md](docs/api/README.md).

## Prérequis
- [x] Docker et Docker Compose
- [x] Node.js (v20+) et npm (pour le développement local hors Docker)
- [x] Git

## Installation (Développement Local)
Ces instructions concernent l'initialisation (Étape 2). L'installation finale Docker Compose viendra plus tard.

### Backend
1. `cd backend`
2. `npm install`
3. `cp .env.example .env`

### Frontend
1. `cd frontend`
2. `npm install`
3. `cp .env.example .env`

## Configuration
### Environment Variables
*(La liste complète des variables sera finalisée lors de l'implémentation complète)*

## Launch (Développement Local)

### Lancer le Backend
```bash
cd backend
npm run start:dev
```
*Le backend sera accessible sur http://localhost:3001/api/v1*

### Lancer le Frontend
```bash
cd frontend
npm run dev
```
*Le frontend sera accessible sur http://localhost:3000*

## Tests
```bash
# Test commands (à venir)
```

## Security
- Secrets should be managed via environment variables.
- No sensitive data should be committed to the repository.
- L'authentification est gérée via JWT (Access & Refresh tokens).
- Les mots de passe sont hachés avec `bcrypt`.

## Limitations
- Training context limitations apply (Projet développé dans le cadre d'un parcours OpenClassrooms).
- Le prototype MVP ne gère pas l'envoi d'e-mails réels pour l'inscription.
- HTTPS en production locale n'est pas géré nativement (hors scope MVP).
