#!/bin/bash

# Script de sauvegarde pour MD Agricole
# Usage: ./backup.sh

set -e

# Configuration
BACKUP_DIR="/var/backups/md-agricole"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="md_agricole"
DB_USER="md_user"
DB_PASSWORD="md_secure_password_2024"
CONTAINER_NAME="md-agricole-db"

# Couleurs
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log_info() {
    echo -e "${YELLOW}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Créer le répertoire de sauvegarde
log_info "Création du répertoire de sauvegarde..."
sudo mkdir -p $BACKUP_DIR
sudo chown $(whoami):$(whoami) $BACKUP_DIR

# Sauvegarde de la base de données
log_info "Sauvegarde de la base de données..."
docker exec $CONTAINER_NAME pg_dump -U $DB_USER -d $DB_NAME > $BACKUP_DIR/db_backup_$DATE.sql

# Sauvegarde des uploads
log_info "Sauvegarde des fichiers uploadés..."
docker cp md-agricole-app:/app/public/uploads $BACKUP_DIR/uploads_$DATE

# Compression des sauvegardes
log_info "Compression des sauvegardes..."
cd $BACKUP_DIR
tar -czf backup_complete_$DATE.tar.gz db_backup_$DATE.sql uploads_$DATE
rm -rf db_backup_$DATE.sql uploads_$DATE

# Nettoyage des anciennes sauvegardes (garder 30 jours)
log_info "Nettoyage des anciennes sauvegardes..."
find $BACKUP_DIR -name "backup_complete_*.tar.gz" -mtime +30 -delete

# Affichage des informations
BACKUP_SIZE=$(du -h $BACKUP_DIR/backup_complete_$DATE.tar.gz | cut -f1)
log_success "Sauvegarde terminée !"
log_success "Fichier : $BACKUP_DIR/backup_complete_$DATE.tar.gz"
log_success "Taille : $BACKUP_SIZE"

# Lister les sauvegardes disponibles
echo ""
log_info "Sauvegardes disponibles :"
ls -lh $BACKUP_DIR/backup_complete_*.tar.gz | tail -5
