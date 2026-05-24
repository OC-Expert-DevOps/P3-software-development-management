# System Patterns

## Architecture
- **Architecture Modulaire** via NestJS (Auth, Files, Users).
- **SPA (Single Page Application)** via React pour le client, interrogeant l'API via des requêtes HTTP.
- **Reverse Proxy** via Nginx pour gérer le routage (fichiers statiques vs `/api/*`) et simplifier la configuration CORS lors des développements et tests locaux en Docker Compose.

## Modèle de Données
- Base de données relationnelle PostgreSQL (Tables: `User`, `File`, `Tag`).
- Soft deletes envisagés pour les fichiers (ou suppression asynchrone par cron).
- Fichiers physiques stockés sur le volume disque avec un nom (UUID) unique, disjoint du nom d'origine.

## Sécurité & API
- **Authentification JWT** avec séparation claire :
  - Access Token (15 min) transmis en Bearer.
  - Refresh Token (7 jours) utilisé pour renouveler la session.
- **Contrat API** standardisé pour les succès (`{ status: "ok", data: ..., meta: ... }`) et les erreurs.
- Mots de passe utilisateurs hachés avec bcrypt (coût 12).
- Validation stricte des entrées via `class-validator` (Backend NestJS).
