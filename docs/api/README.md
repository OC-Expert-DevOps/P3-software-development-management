# Documentation API DataShare

L'API REST est documentée en détail via la spécification OpenAPI 3.0 : [`openapi.yaml`](./openapi.yaml).

## Tableau Récapitulatif des Endpoints

| Méthode | Route | Auth | Description |
|---|---|---|---|
| `POST` | `/api/v1/auth/register` | Non | Créer un compte utilisateur (email, password). |
| `POST` | `/api/v1/auth/login` | Non | Connexion, retourne les tokens JWT (access + refresh). |
| `POST` | `/api/v1/auth/refresh` | Non | Renouvellement du token d'accès via le refresh token. |
| `POST` | `/api/v1/files/upload` | **JWT** | Upload d'un fichier (max 1 Go, multipart/form-data), génère un lien. |
| `GET` | `/api/v1/files` | **JWT** | Liste l'historique des fichiers de l'utilisateur connecté. |
| `DELETE` | `/api/v1/files/{id}` | **JWT** | Supprime un fichier (BDD + physique). Vérifie la propriété. |
| `GET` | `/api/v1/download/{token}` | Non | Retourne les métadonnées publiques du fichier (nom, taille, expiration, booléen si mot de passe requis) avant téléchargement. |
| `POST` | `/api/v1/download/{token}/file`| Non | Stream le fichier. `POST` au lieu de `GET` car le body peut contenir un `password` si le fichier est protégé. |

## Notes sur le format des réponses
Toutes les réponses de succès de l'API suivent le format uniforme suivant :

```json
{
  "status": "ok",
  "data": { ... },
  "meta": { ... }
}
```

Les erreurs suivent le format strict :
```json
{
  "error": {
    "code": "NotFound",
    "http_status": 404,
    "message": "Fichier introuvable.",
    "details": {},
    "correlation_id": "abc-123"
  }
}