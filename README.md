# 🚜 MD Agricole - Application de Matériel Agricole

Une application Next.js moderne pour la vente de matériel agricole en Tunisie, avec authentification, gestion de panier et catalogue de produits.

## 📋 Prérequis

- **Node.js** (version 18 ou supérieure)
- **npm** ou **yarn**
- **PostgreSQL** (version 12 ou supérieure)
- **Git**

## 🚀 Installation et Configuration

### 1. Cloner le projet

```bash
git clone <url-du-repo>
cd md-abacus/app
```

### 2. Installer les dépendances

```bash
# Avec npm
npm install

# Ou avec yarn
yarn install
```

### 3. Configuration de PostgreSQL

#### Option A: Installation locale de PostgreSQL

**Sur Windows:**
1. Télécharger PostgreSQL depuis [postgresql.org](https://www.postgresql.org/download/windows/)
2. Installer avec les paramètres par défaut
3. Noter le mot de passe du superutilisateur `postgres`

**Sur macOS:**
```bash
# Avec Homebrew
brew install postgresql
brew services start postgresql
```

**Sur Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

#### Option B: Utiliser Docker (Recommandé)

**PostgreSQL seul:**
```bash
# Démarrer PostgreSQL avec Docker
docker run --name md-agricole-db \
  -e POSTGRES_USER=md_user \
  -e POSTGRES_PASSWORD=md_password_2024 \
  -e POSTGRES_DB=md_agricole_db \
  -p 5432:5432 \
  -d postgres:16-alpine
```

**Ou utiliser Docker Compose (inclus dans le projet):**
```bash
# Démarrer seulement la base de données
docker-compose up -d db

# Ou démarrer tous les services (DB + App)
docker-compose up -d
```

### 4. Configuration des variables d'environnement

Créer un fichier `.env` à la racine du projet (ou copier depuis `.env.example`) :

```bash
# Copier le fichier d'exemple
cp .env.example .env
```

**Configuration pour Docker:**
```env
# Base de données (avec Docker)
DATABASE_URL="postgresql://md_user:md_password_2024@localhost:5432/md_agricole_db?schema=public"

# NextAuth.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="votre-clé-secrète-très-longue-et-sécurisée"
```

**Configuration pour PostgreSQL local:**
```env
# Base de données (installation locale)
DATABASE_URL="postgresql://postgres:votre_mot_de_passe@localhost:5432/md_agricole_db?schema=public"

# NextAuth.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="votre-clé-secrète-très-longue-et-sécurisée"
```

### 5. Configuration de Prisma

#### Générer le client Prisma
```bash
npx prisma generate
```

#### Créer la base de données et les tables
```bash
# Pousser le schéma vers la base de données
npx prisma db push
```

#### (Optionnel) Peupler la base avec des données de test
```bash
npx prisma db seed
```

### 6. Démarrer l'application

```bash
# Mode développement
npm run dev
# ou
yarn dev
```

L'application sera accessible sur [http://localhost:3000](http://localhost:3000)

## 🐳 Démarrage avec Docker (Alternative complète)

Le projet inclut des fichiers Docker pour un déploiement complet :
- `Dockerfile` - Image de l'application Next.js
- `docker-compose.yml` - Configuration pour la production
- `docker-compose.dev.yml` - Configuration pour le développement

### Prérequis Docker
- **Docker** et **Docker Compose** installés

### Commandes Docker

**Mode Production:**
```bash
# Démarrer tous les services (base de données + application)
docker-compose up -d

# Voir les logs
docker-compose logs -f app
docker-compose logs -f db

# Arrêter les services
docker-compose down

# Reconstruire l'application
docker-compose build --no-cache app
docker-compose up -d
```

**Mode Développement:**
```bash
# Utiliser la configuration de développement
docker-compose -f docker-compose.dev.yml up -d

# Voir les logs en temps réel
docker-compose -f docker-compose.dev.yml logs -f

# Arrêter
docker-compose -f docker-compose.dev.yml down
```

**Commandes utiles:**
```bash
# Voir les conteneurs en cours
docker ps

# Accéder au conteneur de l'application
docker exec -it md_agricole_app bash

# Accéder à PostgreSQL
docker exec -it md_agricole_db psql -U md_user -d md_agricole_db

# Nettoyer les volumes (⚠️ supprime les données)
docker-compose down -v
```

## 📊 Gestion de la base de données

### Connexion PostgreSQL via Container

**Accès direct au conteneur PostgreSQL:**
```bash
# Se connecter à PostgreSQL dans le conteneur
docker exec -it md_agricole_db psql -U md_user -d md_agricole_db

# Ou avec docker-compose
docker-compose exec db psql -U md_user -d md_agricole_db
```

**Commandes PostgreSQL utiles:**
```sql
-- Lister les tables
\dt

-- Voir la structure d'une table
\d products

-- Compter les enregistrements
SELECT COUNT(*) FROM products;

-- Quitter
\q
```

**Sauvegarde et restauration:**
```bash
# Sauvegarder la base de données
docker exec -t md_agricole_db pg_dump -U md_user md_agricole_db > backup.sql

# Restaurer la base de données
docker exec -i md_agricole_db psql -U md_user -d md_agricole_db < backup.sql
```

### Commandes Prisma utiles

```bash
# Voir l'état de la base de données
npx prisma db status

# Réinitialiser la base de données
npx prisma db reset

# Ouvrir Prisma Studio (interface graphique)
npx prisma studio
```

### Structure de la base de données

La base de données contient les tables suivantes :
- `users` - Utilisateurs et authentification
- `accounts` - Comptes OAuth (NextAuth)
- `sessions` - Sessions utilisateur
- `categories` - Catégories de produits
- `products` - Produits agricoles
- `orders` - Commandes
- `order_items` - Articles des commandes

## 🛠️ Scripts disponibles

```bash
# Développement
npm run dev          # Démarrer en mode développement
npm run build        # Construire pour la production
npm run start        # Démarrer en mode production
npm run lint         # Vérifier le code

# Base de données
npm run db:generate  # Générer le client Prisma
npm run db:push      # Pousser le schéma vers la DB
npm run db:migrate   # Créer une migration
npm run db:seed      # Peupler avec des données de test
```

## 🔧 Résolution des problèmes

### Erreur "Can't reach database server"

**Avec Docker:**
```bash
# Vérifier que le conteneur PostgreSQL fonctionne
docker ps | grep postgres

# Redémarrer le conteneur
docker restart md-agricole-db
# ou
docker-compose restart db

# Voir les logs de la base de données
docker logs md-agricole-db
```

**Installation locale:**
```bash
# Vérifier que PostgreSQL est démarré
# Sur Windows (services)
services.msc

# Sur macOS/Linux
sudo systemctl status postgresql
# ou
brew services list | grep postgresql
```

### Erreur "@prisma/client did not initialize"
```bash
# Régénérer le client Prisma
npx prisma generate
```

### Erreur de connexion à la base
1. **Vérifier les variables d'environnement** dans `.env`
2. **Vérifier que PostgreSQL écoute sur le bon port** (5432)
3. **Vérifier les identifiants de connexion**

**Avec Docker:**
```bash
# Tester la connexion depuis l'hôte
docker exec -it md-agricole-db psql -U md_user -d md_agricole_db -c "SELECT version();"

# Vérifier les variables d'environnement du conteneur
docker exec -it md-agricole-db env | grep POSTGRES
```

**Connexion depuis l'application vers le conteneur:**
- L'URL doit pointer vers `localhost:5432` (depuis l'hôte)
- Ou vers `db:5432` (depuis un autre conteneur Docker)

### Configuration des URLs de base de données

**Développement local (sans Docker):**
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/md_agricole_db?schema=public"
```

**Développement avec PostgreSQL en container:**
```env
DATABASE_URL="postgresql://md_user:md_password_2024@localhost:5432/md_agricole_db?schema=public"
```

**Application en container (docker-compose):**
```env
DATABASE_URL="postgresql://md_user:md_password_2024@db:5432/md_agricole_db?schema=public"
```

**Production:**
```env
DATABASE_URL="postgresql://user:password@prod-server:5432/md_agricole_prod?schema=public"
```

### Port 3000 déjà utilisé
```bash
# Trouver le processus utilisant le port
netstat -ano | findstr :3000  # Windows
lsof -i :3000                 # macOS/Linux

# Ou utiliser un autre port
PORT=3001 npm run dev
```

## 📁 Structure du projet

```
app/
├── app/                    # Pages et API routes (App Router)
├── components/            # Composants React réutilisables
├── lib/                   # Utilitaires et configurations
├── prisma/               # Schéma et migrations Prisma
├── public/               # Fichiers statiques
├── scripts/              # Scripts utilitaires
├── .env                  # Variables d'environnement
├── .env.example          # Modèle de configuration
├── package.json          # Dépendances et scripts
├── Dockerfile            # Image Docker de l'application
├── docker-compose.yml    # Configuration Docker (production)
├── docker-compose.dev.yml # Configuration Docker (développement)
├── setup.sh              # Script d'installation (Linux/macOS)
├── setup.ps1             # Script d'installation (Windows)
├── QUICK_START.md        # Guide de démarrage rapide
└── README.md            # Ce fichier
```

## 🐳 Fichiers Docker

### Dockerfile
Construit l'image de l'application Next.js avec :
- Node.js 20 Alpine
- Installation des dépendances
- Génération du client Prisma
- Build optimisé pour la production

### docker-compose.yml (Production)
Services inclus :
- **db** : PostgreSQL 16 avec données persistantes
- **app** : Application Next.js connectée à la base

### docker-compose.dev.yml (Développement)
Configuration pour le développement avec :
- Hot reload activé
- Volumes montés pour le code source
- Base de données séparée pour les tests

## 🌟 Fonctionnalités

- ✅ Authentification avec NextAuth.js
- ✅ Catalogue de produits avec recherche
- ✅ Panier d'achat persistant
- ✅ Gestion des commandes
- ✅ Interface responsive moderne
- ✅ Base de données PostgreSQL avec Prisma
- ✅ Déploiement Docker

## 📞 Support

Pour toute question ou problème :
1. Vérifier cette documentation
2. Consulter les logs : `docker-compose logs` ou console du navigateur
3. Vérifier les issues GitHub du projet

---

**MD Agricole** - Votre partenaire de confiance pour le matériel agricole en Tunisie 🇹🇳

Seeding terminé avec succès!
🔐 Comptes créés:
👨‍💼 Admin: admin@mdagricole.tn / admin123
👤 Client: john@doe.com / johndoe123

