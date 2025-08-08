#!/bin/bash

# Script de restauration pour MD Agricole
# Usage: ./restore.sh backup_complete_YYYYMMDD_HHMMSS.tar.gz

set -e

if [ $# -eq 0 ]; then
    echo "❌ Usage: ./restore.sh <fichier_de_sauvegarde>"
    echo "📋 Sauvegardes disponibles :"
    ls -1 /var/backups/md-agricole/backup_complete_*.tar.gz 2>/dev/null | tail -5 || echo "Aucune sauvegarde trouvée"
    exit 1
fi

BACKUP_FILE=$1
BACKUP_DIR="/var/backups/md-agricole"
TEMP_DIR="/tmp/md-agricole-restore"
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

# Vérifier que le fichier de sauvegarde existe
if [ ! -f "$BACKUP_DIR/$BACKUP_FILE" ]; then
    log_error "Fichier de sauvegarde non trouvé : $BACKUP_DIR/$BACKUP_FILE"
    exit 1
fi

# Confirmation
echo "⚠️  ATTENTION : Cette opération va remplacer toutes les données actuelles !"
echo "📁 Fichier de sauvegarde : $BACKUP_FILE"
read -p "Êtes-vous sûr de vouloir continuer ? (oui/non): " -r
if [[ ! $REPLY =~ ^[Oo][Uu][Ii]$ ]]; then
    echo "Restauration annulée."
    exit 0
fi

# Créer le répertoire temporaire
log_info "Préparation de la restauration..."
rm -rf $TEMP_DIR
mkdir -p $TEMP_DIR

# Extraire la sauvegarde
log_info "Extraction de la sauvegarde..."
cd $TEMP_DIR
tar -xzf $BACKUP_DIR/$BACKUP_FILE

# Arrêter l'application
log_info "Arrêt de l'application..."
docker-compose down

# Démarrer seulement la base de données
log_info "Démarrage de la base de données..."
docker-compose up -d postgres

# Attendre que la base soit prête
log_info "Attente de la base de données..."
sleep 10

# Restaurer la base de données
log_info "Restauration de la base de données..."
docker exec -i $CONTAINER_NAME psql -U $DB_USER -d $DB_NAME < $TEMP_DIR/db_backup_*.sql

# Restaurer les uploads
log_info "Restauration des fichiers uploadés..."
docker-compose up -d app
sleep 5
docker cp $TEMP_DIR/uploads_* md-agricole-app:/app/public/uploads

# Redémarrer l'application complète
log_info "Redémarrage de l'application..."
docker-compose down
docker-compose --env-file .env.production up -d

# Nettoyage
log_info "Nettoyage..."
rm -rf $TEMP_DIR

log_success "Restauration terminée avec succès !"
log_success "🌐 Application accessible sur : https://mdagricole.zidani.org"

# Vérification
log_info "Vérification de l'état des services..."
docker-compose ps
