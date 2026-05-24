# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
**Initialisation (Étape 2)** :
- Initialisation du Backend NestJS.
- Modèle de données Prisma (User, File, Tag).
- Initialisation du Frontend React + Vite.
- Configuration CORS et endpoint /health (Front -> Back).

**Architecture & Conception (Étape 1)** :
- Documentation de l'architecture (`docs/architecture.md`) avec justification des choix techniques (NestJS, React, PostgreSQL).
- Diagramme d'architecture système (Mermaid).
- Modèle de données (MCD) avec schéma Entité-Association et script DDL PostgreSQL indicatif (`docs/data-model.md`).
- Spécification OpenAPI 3.0 définissant le contrat d'interface de l'API (`docs/api/openapi.yaml`).
- Mise à jour initiale de la Memory Bank (`activeContext`, `techContext`, `systemPatterns`, `progress`).
- Mise à jour du `README.md` avec la vue d'ensemble du projet.
