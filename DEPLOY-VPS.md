# 🚀 Déploiement MD Agricole sur VPS

## 📦 Fichiers à copier sur votre VPS

### 1. Structure sur le VPS
```
/opt/md-agricole/
├── app/                    # Tout le dossier app/
├── docker-compose.yml      
├── .env.production        
├── nginx-vps.conf         
├── deploy.sh              
├── backup.sh              
├── restore.sh             
├── monitor.sh             
└── DEPLOYMENT.md          
```

### 2. Commandes sur le VPS

#### A. Préparation initiale (une seule fois)
```bash
# Créer le répertoire
sudo mkdir -p /opt/md-agricole
sudo chown $USER:$USER /opt/md-agricole
cd /opt/md-agricole

# Copier tous vos fichiers ici (manuellement)
```

#### B. Configuration Nginx
```bash
# Copier la config Nginx
sudo cp nginx-vps.conf /etc/nginx/sites-available/mdagricole.zidani.org

# Activer le site
sudo ln -s /etc/nginx/sites-available/mdagricole.zidani.org /etc/nginx/sites-enabled/

# Supprimer le site par défaut
sudo rm -f /etc/nginx/sites-enabled/default

# Tester et recharger
sudo nginx -t
sudo systemctl reload nginx
```

#### C. SSL avec Let's Encrypt
```bash
sudo certbot --nginx -d mdagricole.zidani.org -d www.mdagricole.zidani.org
```

#### D. Déploiement
```bash
# Rendre les scripts exécutables
chmod +x *.sh

# IMPORTANT: Modifier .env.production avec vos vrais mots de passe !
nano .env.production

# Déployer
./deploy.sh

# Post-déploiement (optimisations)
docker-compose exec app npm run post-deploy
```

#### E. Vérification
```bash
# Monitoring
./monitor.sh

# Test direct
curl http://localhost:3007/api/health

# Test via Nginx
curl https://mdagricole.zidani.org/api/health
```

## 🔐 Configuration de sécurité

### 1. Mots de passe à changer dans .env.production
```bash
# Base de données
POSTGRES_PASSWORD="VOTRE_MOT_DE_PASSE_SECURISE"

# NextAuth
NEXTAUTH_SECRET="VOTRE_CLE_SECRETE_TRES_LONGUE_ET_COMPLEXE"
```

### 2. Firewall
```bash
sudo ufw allow 22      # SSH
sudo ufw allow 80      # HTTP
sudo ufw allow 443     # HTTPS
sudo ufw enable
```

### 3. Sauvegardes automatiques
```bash
# Ajouter au crontab
crontab -e

# Sauvegarde quotidienne à 2h du matin
0 2 * * * cd /opt/md-agricole && ./backup.sh >> logs/backup.log 2>&1
```

## 🌐 Accès final

- **Site web** : https://mdagricole.zidani.org
- **Administration** : https://mdagricole.zidani.org/admin
- **Login admin** : admin@mdagricole.tn / admin123

## 🛠️ Commandes de maintenance

```bash
# Voir les logs
docker-compose logs -f app

# Redémarrer
docker-compose restart app

# Sauvegarder
./backup.sh

# Monitoring
./monitor.sh

# Mise à jour (après avoir copié les nouveaux fichiers)
./deploy.sh
```

## 🆘 En cas de problème

### Logs à vérifier :
```bash
# Application
docker-compose logs app

# Nginx
sudo tail -f /var/log/nginx/mdagricole.error.log

# Système
sudo journalctl -u nginx -f
```

### Redémarrage complet :
```bash
docker-compose down
docker system prune -f
./deploy.sh
```
