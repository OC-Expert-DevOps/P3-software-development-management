# Utilisation de l'IA (Copilote)

Dans le cadre du MVP DataShare, j'ai choisi de m'appuyer sur l'IA générative pour implémenter la **User Story 01 : Upload de fichier avec compte**.

## Périmètre confié à l'IA

Les tâches suivantes ont été développées en mode pair-programming assisté par l'IA :
- Scaffolding du module Backend `Files` (Service, Controller, Module).
- Implémentation du DTO `UploadFileDto` avec des validateurs custom via `class-validator` (vérification de l'unicité des tags, parse des entrées multipart/form-data).
- Implémentation de `FilesService` : génération du token `crypto.randomUUID()`, écriture du buffer sur le disque via `fs`, hachage du mot de passe avec `bcrypt`, écriture des métadonnées et gestion des relations avec les `Tags` via l'ORM Prisma.
- Rédaction de la suite de tests unitaires pour `FilesService`.

Ces changements ont été validés dans des commits dédiés préfixés par `feat(ai):` ou `test(ai):`.

## Rôle de supervision et correctifs apportés

J'ai relu de bout en bout le code produit, en veillant notamment aux vulnérabilités courantes liées à l'upload de fichier :
- **Path Traversal** : Bien que l'IA utilisait nativement un `randomUUID` très difficilement manipulable, j'ai ajouté manuellement une couche de sécurité supplémentaire (vérification stricte du namespace avec `path.resolve` et `startsWith`) pour empêcher de manière formelle tout Path Traversal si la stratégie de token venait à évoluer.
- **Liste noire d'extensions** : J'ai élargi la liste initiale proposée par l'IA (`.exe`, `.bat`, etc.) pour inclure des langages de script côté serveur (`.js`, `.php`, `.py`) pouvant amener des exécutions arbitraires.

Ces correctifs font l'objet d'un commit spécifique préfixé par `fix: human review ...`.
