# ⚡ Guide de Démarrage Rapide - MD Agricole

## 🚀 Installation en 5 minutes

### Option 1: Script automatique (Recommandé)

**Sur Windows (PowerShell):**
```powershell
# Ouvrir PowerShell en tant qu'administrateur
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
.\setup.ps1
```

**Sur macOS/Linux:**
```bash
# Rendre le script exécutable
chmod +x setup.sh
./setup.sh
```

### Option 2: Installation manuelle

```bash
# 1. Installer les dépendances
npm install
# ou
yarn install

# 2. Configurer l'environnement
cp .env.example .env
# Éditer le fichier .env avec vos paramètres

# 3. Démarrer PostgreSQL avec Docker
docker run --name md-agricole-db \
  -e POSTGRES_USER=md_user \
  -e POSTGRES_PASSWORD=md_password_2024 \
  -e POSTGRES_DB=md_agricole_db \
  -p 5432:5432 \
  -d postgres:16-alpine

# 4. Configurer Prisma
npx prisma generate
npx prisma db push
npx prisma db seed

# 5. Démarrer l'application
npm run dev
```

## 🔧 Configuration Minimale

### Fichier .env requis:
```env
DATABASE_URL="postgresql://md_user:md_password_2024@localhost:5432/md_agricole_db?schema=public"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="votre-clé-secrète-longue-et-sécurisée"
```

## 🐳 Démarrage avec Docker Compose

```bash
# Démarrer tous les services
docker-compose up -d

# Voir les logs
docker-compose logs -f app

# Arrêter
docker-compose down
```

## 📊 Vérifications après installation

1. **Application accessible:** http://localhost:3000
2. **Base de données:** `docker ps` doit montrer le conteneur PostgreSQL
3. **Prisma Studio:** `npx prisma studio` (optionnel)

## 🆘 Résolution rapide des problèmes

### Erreur de base de données
```bash
# Redémarrer PostgreSQL
docker restart md-agricole-db

# Vérifier la connexion
npx prisma db status
```

### Erreur Prisma
```bash
# Régénérer le client
npx prisma generate

# Recréer les tables
npx prisma db push --force-reset
```

### Port occupé
```bash
# Utiliser un autre port
PORT=3001 npm run dev
```

## 📞 Support

- 📖 Documentation complète: `README.md`
- 🐛 Problèmes: Vérifier les logs dans la console
- 💬 Questions: Consulter la section troubleshooting du README

---

**Temps d'installation estimé:** 5-10 minutes ⏱️
