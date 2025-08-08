# 🚀 Guide de Déploiement - MD Agricole

## 📋 Prérequis sur le VPS

### 1. Logiciels requis
```bash
# Mettre à jour le système
sudo apt update && sudo apt upgrade -y

# Installer Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Installer Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Installer Nginx (déjà fait)
sudo apt install nginx -y

# Installer Certbot pour SSL
sudo apt install certbot python3-certbot-nginx -y
```

### 2. Configuration du firewall
```bash
sudo ufw allow 22      # SSH
sudo ufw allow 80      # HTTP
sudo ufw allow 443     # HTTPS
sudo ufw allow 3007    # Application (temporaire pour test)
sudo ufw enable
```

## 📁 Fichiers à copier sur le VPS

### Structure des dossiers sur le VPS :
```
/opt/md-agricole/
├── app/                    # Votre application
├── docker-compose.yml      # Configuration Docker
├── .env.production        # Variables d'environnement
├── nginx-vps.conf         # Configuration Nginx
├── deploy.sh              # Script de déploiement
├── backup.sh              # Script de sauvegarde
├── restore.sh             # Script de restauration
└── logs/                  # Logs de l'application
```

## 🔧 Étapes de déploiement

### 1. Préparer le VPS
```bash
# Créer le répertoire de l'application
sudo mkdir -p /opt/md-agricole
sudo chown $USER:$USER /opt/md-agricole
cd /opt/md-agricole

# Créer les répertoires nécessaires
mkdir -p logs ssl
```

### 2. Copier les fichiers
Copiez manuellement ces fichiers depuis votre machine locale vers `/opt/md-agricole/` :
- Tout le dossier `app/`
- `docker-compose.yml`
- `.env.production`
- `nginx-vps.conf`
- `deploy.sh`
- `backup.sh`
- `restore.sh`

### 3. Configurer Nginx
```bash
# Copier la configuration Nginx
sudo cp nginx-vps.conf /etc/nginx/sites-available/mdagricole.zidani.org

# Activer le site
sudo ln -s /etc/nginx/sites-available/mdagricole.zidani.org /etc/nginx/sites-enabled/

# Désactiver le site par défaut
sudo rm -f /etc/nginx/sites-enabled/default

# Tester la configuration
sudo nginx -t

# Recharger Nginx
sudo systemctl reload nginx
```

### 4. Configurer SSL avec Let's Encrypt
```bash
# Obtenir le certificat SSL
sudo certbot --nginx -d mdagricole.zidani.org -d www.mdagricole.zidani.org

# Vérifier le renouvellement automatique
sudo certbot renew --dry-run
```

### 5. Déployer l'application
```bash
# Rendre le script exécutable
chmod +x deploy.sh backup.sh restore.sh

# Modifier les mots de passe dans .env.production
nano .env.production

# Déployer
./deploy.sh
```

### 6. Post-déploiement
```bash
# Exécuter le script de post-déploiement
docker-compose exec app npm run post-deploy

# Vérifier que tout fonctionne
curl -f http://localhost:3007/api/health
```

## 🔐 Sécurité

### 1. Changez TOUS les mots de passe par défaut dans `.env.production`
- `POSTGRES_PASSWORD`
- `NEXTAUTH_SECRET`

### 2. Configurez les sauvegardes automatiques
```bash
# Ajouter au crontab
crontab -e

# Ajouter cette ligne pour une sauvegarde quotidienne à 2h du matin
0 2 * * * cd /opt/md-agricole && ./backup.sh >> logs/backup.log 2>&1
```

### 3. Monitoring des logs
```bash
# Voir les logs de l'application
docker-compose logs -f app

# Voir les logs Nginx
sudo tail -f /var/log/nginx/mdagricole.access.log
sudo tail -f /var/log/nginx/mdagricole.error.log
```

## 🛠️ Commandes utiles

### Gestion de l'application
```bash
# Voir l'état des services
docker-compose ps

# Redémarrer l'application
docker-compose restart app

# Voir les logs
docker-compose logs -f app

# Mettre à jour l'application
./deploy.sh

# Sauvegarder
./backup.sh

# Restaurer
./restore.sh backup_complete_YYYYMMDD_HHMMSS.tar.gz
```

### Gestion de la base de données
```bash
# Se connecter à la base
docker-compose exec postgres psql -U md_user -d md_agricole

# Exporter la base
docker-compose exec postgres pg_dump -U md_user md_agricole > backup.sql

# Importer une base
docker-compose exec -T postgres psql -U md_user -d md_agricole < backup.sql
```

## 🌐 Accès à l'application

- **Site web** : https://mdagricole.zidani.org
- **Administration** : https://mdagricole.zidani.org/admin
- **Login admin** : admin@mdagricole.tn / admin123

## 🆘 Dépannage

### Si l'application ne démarre pas :
```bash
# Vérifier les logs
docker-compose logs app

# Redémarrer les services
docker-compose down && docker-compose up -d

# Vérifier la connectivité de la base
docker-compose exec app npx prisma db push
```

### Si Nginx ne fonctionne pas :
```bash
# Vérifier la configuration
sudo nginx -t

# Voir les logs d'erreur
sudo tail -f /var/log/nginx/error.log

# Redémarrer Nginx
sudo systemctl restart nginx
```

### Si SSL ne fonctionne pas :
```bash
# Renouveler le certificat
sudo certbot renew

# Vérifier l'expiration
sudo certbot certificates
```
