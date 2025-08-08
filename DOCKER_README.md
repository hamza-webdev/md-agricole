# Guide Docker pour MD Agricole

Ce projet utilise Docker pour faciliter le déploiement et le développement. Voici comment utiliser les différents fichiers Docker.

## Fichiers Docker disponibles

### Production
- `Dockerfile` : Image Docker pour la production
- `docker-compose.yml` : Configuration Docker Compose pour la production

### Développement
- `Dockerfile.dev` : Image Docker pour le développement
- `docker-compose.dev.yml` : Configuration Docker Compose pour le développement

## Commandes utiles

### Pour la production

```bash
# Construire et démarrer les services
docker-compose up --build

# Démarrer en arrière-plan
docker-compose up -d

# Arrêter les services
docker-compose down

# Voir les logs
docker-compose logs -f app
```

### Pour le développement

```bash
# Construire et démarrer les services de développement
docker-compose -f docker-compose.dev.yml up --build

# Démarrer en arrière-plan
docker-compose -f docker-compose.dev.yml up -d

# Arrêter les services de développement
docker-compose -f docker-compose.dev.yml down

# Voir les logs
docker-compose -f docker-compose.dev.yml logs -f app
```

### Commandes de base de données

```bash
# Accéder à la base de données PostgreSQL (production)
docker-compose exec db psql -U md_user -d md_agricole_db

# Accéder à la base de données PostgreSQL (développement)
docker-compose -f docker-compose.dev.yml exec db psql -U md_user -d md_agricole_db_dev

# Exécuter les migrations Prisma
docker-compose exec app yarn db:migrate

# Générer le client Prisma
docker-compose exec app yarn db:generate

# Peupler la base de données
docker-compose exec app yarn db:seed
```

### Nettoyage

```bash
# Supprimer tous les conteneurs et volumes
docker-compose down -v

# Supprimer les images non utilisées
docker image prune -f

# Nettoyage complet
docker system prune -a
```

## Configuration des environnements

### Production
- Port de l'application : 3000
- Port de la base de données : 5432
- Base de données : md_agricole_db

### Développement
- Port de l'application : 3001
- Port de la base de données : 5433
- Base de données : md_agricole_db_dev

## Variables d'environnement

Assurez-vous de configurer les variables d'environnement appropriées :

- `DATABASE_URL` : URL de connexion à la base de données
- `NEXTAUTH_SECRET` : Clé secrète pour NextAuth
- `NEXTAUTH_URL` : URL de base de l'application

## Résolution des problèmes

### Problème de build
Si le build échoue, essayez :
```bash
docker-compose build --no-cache app
```

### Problème de base de données
Si la base de données ne démarre pas :
```bash
docker-compose down -v
docker-compose up --build
```

### Problème de permissions
Sur Linux/Mac, vous pourriez avoir besoin de :
```bash
sudo chown -R $USER:$USER .
```
