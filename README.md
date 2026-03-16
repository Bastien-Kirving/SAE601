# SAE601 — Portfolio Spider-Man

Portfolio interactif sur le thème Spider-Man (multivers), développé dans le cadre de la SAE601. Il combine un frontend React avec des effets 3D Three.js et un backend PHP REST API maison.

**Production :** [bastien-lievre.com](https://bastien-lievre.com)

---

## Table des matières

1. [Stack technique](#stack-technique)
2. [Architecture du projet](#architecture-du-projet)
3. [Prérequis](#prérequis)
4. [Installation et démarrage](#installation-et-démarrage)
5. [Configuration](#configuration)
6. [Base de données](#base-de-données)
7. [API REST — Endpoints](#api-rest--endpoints)
8. [Fonctionnalités implémentées](#fonctionnalités-implémentées)
9. [Panneau d'administration](#panneau-dadministration)
10. [Déploiement en production](#déploiement-en-production)
11. [Tests](#tests)

---

## Stack technique

| Couche | Technologie |
|--------|-------------|
| Frontend | React 18.3, Vite 6, React Router 7 |
| 3D / Animations | Three.js 0.159, @react-three/fiber, @react-three/drei |
| Backend | PHP 7.4+ (MVC custom, sans framework) |
| Base de données | MySQL 5.7+ / MariaDB |
| Auth | JWT (implémentation manuelle, expiration 24h) |
| Email | SMTP custom (Infomaniak / Gmail / OVH) |
| Serveur | Apache + mod_rewrite |
| Tests E2E | Playwright 1.58 |

---

## Architecture du projet

```
SAE601/
├── backend/                  # API REST PHP
│   ├── config/
│   │   ├── config.example.php   # Modèle de configuration (copier → config.php)
│   │   ├── config.php           # Config DB + JWT (ignoré par git)
│   │   └── Database.php         # Singleton PDO
│   ├── controllers/          # 8 contrôleurs CRUD
│   │   ├── AuthController.php
│   │   ├── ProjectController.php
│   │   ├── SkillController.php
│   │   ├── MessageController.php
│   │   ├── SettingController.php
│   │   ├── ThemeController.php
│   │   ├── UploadController.php
│   │   └── StatsController.php
│   ├── core/
│   │   ├── Router.php           # Routeur REST avec params dynamiques
│   │   ├── Controller.php       # Contrôleur de base (helpers JSON)
│   │   ├── Model.php            # Modèle de base (PDO)
│   │   └── Mailer.php           # Client SMTP (TLS/SSL)
│   ├── middleware/
│   │   ├── AuthMiddleware.php   # Validation JWT
│   │   └── RateLimitMiddleware.php
│   ├── models/               # 6 modèles
│   ├── routes/
│   │   └── api.php              # Définition de toutes les routes
│   ├── .env                     # Variables d'environnement (ignoré par git)
│   ├── .env.example             # Modèle .env
│   ├── .htaccess                # Réécriture URL Apache
│   └── index.php                # Point d'entrée de l'API
│
├── frontend/                 # SPA React
│   ├── src/
│   │   ├── App.jsx              # Composant racine (transitions au scroll)
│   │   ├── api/
│   │   │   └── apiFetch.js      # Wrapper API centralisé avec JWT
│   │   ├── components/          # Composants UI
│   │   │   ├── Navbar/
│   │   │   ├── HeroProfile/     # Section hero avec profil
│   │   │   ├── HeroProject/     # Carousel de projets
│   │   │   ├── Skills/          # Barres de compétences
│   │   │   ├── Contact/         # Formulaire de contact
│   │   │   ├── MultiverseBackground/  # Tunnel 3D Three.js
│   │   │   ├── SpiderTransition/
│   │   │   ├── SpotTransition/
│   │   │   ├── LeapOfFaith/
│   │   │   ├── Toast/
│   │   │   └── SpiderWebClick/  # Animation clic toile d'araignée
│   │   ├── hooks/
│   │   │   ├── useDynamicTheme.js    # Changement de thème dynamique
│   │   │   └── useScrollAnimations.js
│   │   ├── pages/               # Pages admin (chargement lazy)
│   │   │   ├── Admin.jsx
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── AdminLogin.jsx
│   │   │   ├── AdminProjects.jsx
│   │   │   ├── AdminSkills.jsx
│   │   │   ├── AdminMessages.jsx
│   │   │   ├── AdminThemes.jsx
│   │   │   └── AdminProfile.jsx
│   │   └── styles/              # CSS global + thèmes
│   ├── public/                  # Assets statiques (images, SVG)
│   ├── dist/                    # Build de production (ignoré par git)
│   └── vite.config.js           # Config Vite + proxy API
│
└── database/
    ├── schema.sql               # Définition des 9 tables
    └── seed.sql                 # Données de démo
```

---

## Prérequis

- **Node.js** 18 ou supérieur
- **PHP** 7.4 ou supérieur (avec extensions : `pdo_mysql`, `openssl`, `mbstring`)
- **MySQL** 5.7+ ou MariaDB
- **Apache** avec `mod_rewrite` activé (ou `php -S` pour le développement)

---

## Installation et démarrage

### 1. Cloner le projet

```bash
git clone <url-du-repo> SAE601
cd SAE601
```

### 2. Configurer le backend

```bash
cd backend

# Copier les fichiers de configuration
cp config/config.example.php config/config.php
cp .env.example .env
```

Editer `config/config.php` avec vos identifiants base de données et une clé JWT :

```php
define('DB_HOST', 'localhost');
define('DB_NAME', 'portfolio_db');
define('DB_USER', 'root');
define('DB_PASS', 'votre_mot_de_passe');
define('JWT_SECRET', 'une_cle_secrete_de_64_caracteres_minimum');
```

Editer `.env` avec vos paramètres SMTP et origines CORS autorisées :

```env
ALLOWED_ORIGINS=http://localhost:3000,https://votre-domaine.com
ADMIN_EMAIL=votre@email.com

SMTP_HOST=mail.infomaniak.com
SMTP_PORT=587
SMTP_USER=contact@votre-domaine.com
SMTP_PASS=votre_mot_de_passe_smtp
SMTP_FROM_EMAIL=contact@votre-domaine.com
SMTP_FROM_NAME=Portfolio Contact
```

### 3. Créer la base de données

```bash
# Créer la base et importer le schéma
mysql -u root -p -e "CREATE DATABASE portfolio_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -u root -p portfolio_db < ../database/schema.sql

# (Optionnel) Charger les données de démo
mysql -u root -p portfolio_db < ../database/seed.sql
```

### 4. Démarrer le backend (développement)

```bash
cd backend
php -S localhost:8080
```

> L'API sera disponible sur `http://localhost:8080/api/`

### 5. Installer et démarrer le frontend

```bash
cd frontend
npm install
npm run dev
```

> Le site sera disponible sur `http://localhost:3000`
>
> En développement, Vite redirige automatiquement toutes les requêtes `/api/` vers `localhost:8080` (proxy configuré dans `vite.config.js`).

### Résumé démarrage rapide

```bash
# Terminal 1 — Backend
cd SAE601/backend && php -S localhost:8080

# Terminal 2 — Frontend
cd SAE601/frontend && npm run dev

# Navigateur
# Site public   : http://localhost:3000
# Admin         : http://localhost:3000/admin/login
# Identifiants  : admin@portfolio.com / password
```

> Après la première connexion, changez le mot de passe via le profil admin.

---

## Configuration

### Proxy Vite (développement)

Le fichier [frontend/vite.config.js](frontend/vite.config.js) configure le proxy :

```js
proxy: {
  '/api': 'http://localhost:8080',
  '/uploads': 'http://localhost:8080'
}
```

Ainsi le frontend appelle `/api/projects` et Vite redirige vers `localhost:8080/api/projects` — pas de problème CORS en local.

### Variables d'environnement frontend

Les fichiers `.env.development` et `.env.production` sont volontairement vides : la variable `VITE_API_BASE_URL` reste vide, ce qui signifie que les appels API utilisent le chemin relatif `/api` (proxy en dev, même domaine en prod).

---

## Base de données

Le schéma contient **9 tables** :

| Table | Description |
|-------|-------------|
| `users` | Comptes administrateurs (bcrypt) |
| `projects` | Projets du portfolio |
| `technologies` | Tags technologiques (ex: React, PHP) |
| `project_technologies` | Table pivot projets ↔ technologies (N:N) |
| `skills` | Compétences avec niveau (0-100%) et catégorie |
| `messages` | Soumissions du formulaire de contact |
| `themes` | Thèmes visuels (couleurs + CSS custom) |
| `user_preferences` | Préférences utilisateur (thème actif, dark mode) |
| `settings` | Configuration globale du site (clé/valeur) |

Le fichier [database/schema.sql](database/schema.sql) crée toutes les tables. Le fichier [database/seed.sql](database/seed.sql) insère des données de démo (3 projets, 10 compétences, 3 thèmes).

---

## API REST — Endpoints

Toutes les réponses sont en JSON. Les routes protégées nécessitent le header :
```
Authorization: Bearer <token>
```

### Authentification

| Méthode | Route | Auth | Description |
|---------|-------|------|-------------|
| POST | `/api/login` | Non | Connexion → retourne token + user |
| POST | `/api/register` | Non | Création de compte admin |
| GET | `/api/auth/verify` | Oui | Vérifier la validité du token |

### Projets

| Méthode | Route | Auth | Description |
|---------|-------|------|-------------|
| GET | `/api/projects` | Non | Liste des projets actifs avec technologies |
| GET | `/api/projects/{id}` | Non | Détail d'un projet |
| POST | `/api/projects` | Oui | Créer un projet |
| PUT | `/api/projects/{id}` | Oui | Modifier un projet |
| DELETE | `/api/projects/{id}` | Oui | Supprimer un projet |

### Compétences

| Méthode | Route | Auth | Description |
|---------|-------|------|-------------|
| GET | `/api/skills` | Non | Liste toutes les compétences |
| POST | `/api/skills` | Oui | Créer une compétence |
| PUT | `/api/skills/{id}` | Oui | Modifier une compétence |
| DELETE | `/api/skills/{id}` | Oui | Supprimer une compétence |

### Messages (formulaire de contact)

| Méthode | Route | Auth | Description |
|---------|-------|------|-------------|
| POST | `/api/messages` | Non (rate-limit) | Envoyer un message |
| GET | `/api/messages` | Oui | Liste des messages (paginée) |
| PUT | `/api/messages/{id}` | Oui | Marquer comme lu |
| DELETE | `/api/messages/{id}` | Oui | Supprimer un message |

### Autres

| Méthode | Route | Auth | Description |
|---------|-------|------|-------------|
| GET | `/api/settings` | Non | Paramètres du site |
| PUT | `/api/settings` | Oui | Modifier les paramètres |
| GET | `/api/themes` | Non | Liste des thèmes |
| PUT | `/api/themes/{id}` | Oui | Modifier un thème |
| POST | `/api/upload` | Oui | Upload d'image |
| GET | `/api/stats` | Oui | Statistiques dashboard |

### Exemple d'utilisation

```js
// Connexion
const res = await fetch('/api/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'admin@portfolio.com', password: 'password' })
});
const { token } = await res.json();

// Requête protégée
const projects = await fetch('/api/projects', {
  headers: { 'Authorization': `Bearer ${token}` }
}).then(r => r.json());
```

---

## Fonctionnalités implémentées

### Site public

- **Fond 3D multivers** — tunnel animé en Three.js qui défile au scroll
- **Transitions thématiques au scroll** — changement de thème visuel selon la section
- **Effets toile d'araignée** — animation SVG au clic n'importe où sur la page
- **Section Hero** — présentation avec photo, titre et sous-titre éditables via l'admin
- **Carousel de projets** — affichage des projets avec image, description et liens (GitHub, démo)
- **Barres de compétences** — compétences groupées par catégorie (Frontend, Backend, DevOps) avec niveau en %
- **Formulaire de contact** — envoi d'email via SMTP avec rate-limiting côté serveur
- **3 thèmes Spider-Man** : Miles Morales (défaut), Gwen Stacy, Spider-Verse Glitch
- **Design responsive** — adapté mobile / tablette / desktop

### Sécurité

- Authentification JWT (expiration 24h, déconnexion auto si token invalide)
- Mots de passe hashés avec bcrypt
- Requêtes SQL via PDO + requêtes préparées (protection injections SQL)
- Validation et échappement des entrées (`htmlspecialchars`)
- CORS configuré sur origines explicites
- Rate limiting sur le login et le formulaire de contact
- Fichiers sensibles (`.env`, `.sql`) bloqués via `.htaccess`

---

## Panneau d'administration

Accessible sur `/admin/login` (identifiants : `admin@portfolio.com` / `password` après seed).

| Page | Route admin | Fonctionnalité |
|------|-------------|----------------|
| Dashboard | `/admin` | Stats : messages non lus, nb projets, compétences |
| Projets | `/admin/projects` | CRUD complet avec upload d'image et tags technologies |
| Compétences | `/admin/skills` | CRUD avec catégorie, niveau (slider), icône |
| Messages | `/admin/messages` | Boîte de réception, marquer lu/non-lu, supprimer |
| Profil | `/admin/profile` | Titre, sous-titre, email de contact, liens sociaux |
| Thèmes | `/admin/themes` | Couleurs primaire/secondaire/fond/texte + CSS custom |

Les pages admin sont chargées en **lazy loading** pour optimiser les performances initiales.

---

## Déploiement en production

### Build du frontend

```bash
cd frontend
npm run build
# Les fichiers compilés sont dans frontend/dist/
```

### Structure sur l'hébergeur (Infomaniak)

```
sites/bastien-lievre.com/
├── index.html            ← frontend/dist/index.html
├── assets/               ← frontend/dist/assets/
└── api/                  ← backend/ (API PHP)
    ├── index.php
    ├── .env              (configurer avec identifiants prod)
    ├── config/config.php (configurer avec identifiants prod)
    └── ...
```

### Checklist déploiement

- [ ] Configurer `config/config.php` avec les identifiants MySQL de prod
- [ ] Configurer `.env` avec SMTP prod et `ALLOWED_ORIGINS` correct
- [ ] Importer `database/schema.sql` sur la base de données distante
- [ ] Uploader `backend/` dans le dossier `api/` du serveur
- [ ] Uploader le contenu de `frontend/dist/` à la racine du domaine
- [ ] Vérifier que `mod_rewrite` est activé (`.htaccess`)
- [ ] Changer le mot de passe admin depuis le panneau

---

## Tests

### Tests E2E (Playwright)

```bash
cd frontend
npx playwright test
```

### Tests backend (PHPUnit)

```bash
cd backend
php phpunit.phar tests/
```

### Script de test de connexion

Un script de débogage est disponible si nécessaire :

```bash
php backend/public/test_login.php
```

---

## Structure des commits récents

Les derniers commits concernent principalement les corrections d'envoi d'email :
- Support SMTP Infomaniak (TLS port 587)
- Rendu conditionnel du Mailer (fallback si config absente)
- Suppression de `mail()` natif (non disponible sur Infomaniak)

---

*Projet développé par Bastien Lièvre dans le cadre de la SAE601 — IUT MMI.*
