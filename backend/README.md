# DailyRecap - Backend API

> **Cœur logique et moteur de données du système DailyRecap.**
> Une API RESTful performante, sécurisée et documentée avec FastAPI.

-----

## Sommaire

1.  [Stack Technique]
2.  [Sécurité & Auth]
3.  [Installation]
4.  [Documentation API]
5.  [Structure]

-----

## Stack Technique

  * **Framework :** [FastAPI](https://www.google.com/search?q=https://fastapi.tiangolo.com/) (Haute performance, typage Python)
  * **Base de données :** [PostgreSQL](https://www.google.com/search?q=https://www.postgresql.org/) (via SQLAlchemy)
  * **Migrations :** [Alembic](https://www.google.com/search?q=https://alembic.sqlalchemy.org/)
  * **Authentification :** [JWT (JSON Web Tokens)](https://www.google.com/search?q=https://jwt.io/) & Passlib (hachage bcrypt)
  * **Serveur :** [Uvicorn](https://www.google.com/search?q=https://www.uvicorn.org/)

-----

## Sécurité & Auth

L'API implémente un système d'authentification robuste :

  * **OAuth2** avec flux de mot de passe et porteur de jeton (Bearer Token).
  * **Hachage des mots de passe** via l'algorithme `bcrypt`.
  * **Contrôle d'accès basé sur les rôles (RBAC)** : Les routes sont protégées par des dépendances vérifiant les permissions (Admin, Manager, User).

-----

## Installation

### Pré-requis

  * Python 3.9+
  * PostgreSQL installé et configuré

### Étapes

1.  **Créer un environnement virtuel**

    ```bash
    python -m venv venv
    source venv/bin/activate  # Linux/Mac
    # ou
    venv\Scripts\activate     # Windows
    ```

2.  **Installer les dépendances**

    ```bash
    pip install -r requirements.txt
    ```

3.  **Variables d'environnement**
    Créez un fichier `.env` dans le dossier `backend/` :

    ```env
    DATABASE_URL=postgresql://user:password@localhost/dailyrecap
    SECRET_KEY=votre_cle_secrete_tres_longue
    ALGORITHM=HS256
    ACCESS_TOKEN_EXPIRE_MINUTES=1440
    ```

4.  **Lancer l'API**

    ```bash
    uvicorn app.main:app --reload
    ```

-----

## Documentation API

Une fois le serveur lancé, la documentation interactive est disponible automatiquement :

  * **Swagger UI :** `http://localhost:8000/docs`
  * **ReDoc :** `http://localhost:8000/redoc`

-----

## Structure

```text
backend/
├── app/
│   ├── api/          # Points d'entrée (Endpoints)
│   ├── core/         # Config, sécurité, JWT
│   ├── models/       # Modèles SQLAlchemy (BBDD)
│   ├── schemas/      # Modèles Pydantic (Validation)
│   ├── services/     # Logique métier
│   └── main.py       # Initialisation FastAPI
├── alembic/          # Historique des migrations
└── requirements.txt  # Dépendances Python
```

