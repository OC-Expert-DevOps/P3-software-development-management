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

## Installation
*(Les instructions détaillées d'installation via Docker Compose seront ajoutées à l'issue de l'implémentation, Étape 4).*

## Configuration
### Environment Variables
| Name | Required | Type | Default | Scope | Description | Example |
|------|----------|------|---------|-------|-------------|---------|
| `APP_ENV` | No | string | `dev` | runtime | Application environment | `dev` |

*(La liste complète des variables sera ajoutée lors du développement)*

## Launch
```bash
# Launch commands (à venir)
```

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
