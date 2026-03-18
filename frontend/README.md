

# DailyRecap - Frontend Portal

> **Système de reporting quotidien intelligent pour équipes agiles.** \> Une interface moderne, réactive et sécurisée pour la gestion des rapports et le suivi de projets.

-----

## Sommaire

1.  [Aperçu](https://www.google.com/search?q=%23-aper%C3%A7u)
2.  [Architecture Tech](https://www.google.com/search?q=%23-architecture-tech)
3.  [Fonctionnalités Clés](https://www.google.com/search?q=%23-fonctionnalit%C3%A9s-cl%C3%A9s)
4.  [Installation et Lancement](https://www.google.com/search?q=%23-installation-et-lancement)
5.  [Structure du Projet](https://www.google.com/search?q=%23-structure-du-projet)
6.  [Sécurité et Authentification](https://www.google.com/search?q=%23-s%C3%A9curit%C3%A9-et-authentification)

-----

## Aperçu

**DailyRecap** permet aux collaborateurs de soumettre leurs rapports quotidiens, aux managers de superviser les projets et aux administrateurs de gérer les accès. L'application met l'accent sur l'expérience utilisateur (UX) avec des retours instantanés via des notifications (Toasts) et une navigation fluide.

-----

## Architecture Tech

Le frontend est bâti sur une stack moderne pour garantir performance et maintenabilité :

  * **Framework :** [React 18](https://www.google.com/search?q=https://reactjs.org/) (Hooks, Context API)
  * **Build Tool :** [Vite.js](https://www.google.com/search?q=https://vitejs.dev/) (Ultra-rapide)
  * **Styling :** [Tailwind CSS](https://www.google.com/search?q=https://tailwindcss.com/) (Design Utility-First)
  * **Routing :** [React Router 6](https://www.google.com/search?q=https://reactrouter.com/) (Gestion des accès par rôles)
  * **Client HTTP :** [Axios](https://www.google.com/search?q=https://axios-http.com/) (Intercepteurs de jetons JWT)
  * **Notifications :** Context Provider personnalisé pour les Toasts.

-----

## Fonctionnalités Clés

### Authentification & Sécurité

  * **Persistance de session :** Restauration automatique via JWT & LocalStorage.
  * **Routes Protégées :** Gardiens de navigation (`ProtectedRoute`) basés sur les rôles (Admin, Manager, User).
  * **Validation en temps réel :** Feedback instantané sur les formulaires de connexion.

### Espace Administration

  * **Dashboard de Statistiques :** Calcul temps réel de l'activité des utilisateurs.
  * **Gestion CRUD :** Création, modification et désactivation d'utilisateurs.
  * **Filtres Avancés :** Recherche dynamique par rôle ou statut.

### Reporting & Feed

  * **Soumission de Rapports :** Interface intuitive pour la saisie quotidienne.
  * **Fil d'actualité :** Visualisation des activités récentes de l'équipe.

-----

## Installation et Lancement

### Pré-requis

  * [Node.js](https://www.google.com/search?q=https://nodejs.org/) (v16 ou supérieur)
  * [npm](https://www.google.com/search?q=https://www.npmjs.com/) ou [yarn](https://www.google.com/search?q=https://yarnpkg.com/)

### Étapes

1.  **Cloner le projet**

    ```bash
    git clone https://github.com/ton-pseudo/dailyrecap.git
    cd dailyrecap/frontend
    ```

2.  **Installer les dépendances**

    ```bash
    npm install
    ```

3.  **Configurer les variables d'environnement**
    Créez un fichier `.env` à la racine du dossier frontend :

    ```env
    VITE_API_URL=http://localhost:8000/api
    ```

4.  **Lancer le serveur de développement**

    ```bash
    npm run dev
    ```

    L'application sera disponible sur `http://localhost:5173`

-----

## Structure du Projet

```text
src/
├── components/      # Composants réutilisables (UI, Auth, Layout)
├── context/         # Gestion des états globaux (Auth, Toast)
├── hooks/           # Logique métier personnalisée (useAdmin, useAuth)
├── pages/           # Pages de l'application par domaine (Admin, Manager, User)
├── services/        # Appels API (Axios instances)
├── assets/          # Images et styles globaux
└── App.jsx          # Point d'entrée, Routage principal
```

-----

## Sécurité et Authentification

L'application utilise un flux **Stateless JWT**.

1.  Le token est stocké dans le `localStorage`.
2.  À chaque chargement, le `AuthProvider` valide le token auprès du backend.
3.  Les `ProtectedRoute` empêchent tout rendu de composant si l'utilisateur n'est pas certifié.

-----

## Design & UI (Work in Progress)

Le projet utilise **Tailwind CSS** pour une interface propre et responsive. Des améliorations de design sont prévues pour les phases suivantes afin d'affiner l'identité visuelle.

-----

*Auteur: Daniel*

-----
