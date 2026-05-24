# Tech Context

## Technologies
- **Backend**: NestJS (TypeScript), Prisma (ORM)
- **Frontend**: React, Vite, TypeScript
- **Base de données**: PostgreSQL
- **Stockage**: Volume local (FS)
- **Authentification**: JWT (Access 15m / Refresh 7d) + bcrypt
- **Tests**: Jest (Backend), Vitest (Frontend), Cypress (E2E), k6 (Performance)
- **Serveur/Proxy**: Nginx (Docker Compose)

## Constraints
- Déploiement local obligatoire via `docker-compose up`.
- API REST structurée selon le format défini (Data/Meta).
- Sécurité renforcée (pas de secrets exposés, validation stricte).
- L'architecture doit permettre de livrer le MVP en 4 semaines.
