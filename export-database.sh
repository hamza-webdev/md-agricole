#!/bin/bash

# Script d'export de la base de données MD Agricole locale
# Usage: ./export-database.sh

set -e

# Configuration locale (ajustez selon votre configuration)
LOCAL_DB_HOST="localhost"
LOCAL_DB_PORT="5432"
LOCAL_DB_NAME="md_agricole_db"
LOCAL_DB_USER="md_user"
LOCAL_DB_PASSWORD="md_password_2024"

# Configuration pour Docker local (si vous utilisez Docker)
DOCKER_CONTAINER="md_agricole_db"

# Répertoire d'export
EXPORT_DIR="./database-exports"
DATE=$(date +%Y%m%d_%H%M%S)
EXPORT_FILE="md_agricole_export_${DATE}.sql"

# Couleurs
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

echo "📦 Export de la base de données MD Agricole"
echo "==========================================="

# Créer le répertoire d'export
mkdir -p $EXPORT_DIR

log_info "Détection de l'environnement..."

# Vérifier si Docker est utilisé
if docker ps | grep -q $DOCKER_CONTAINER; then
    log_info "Base de données Docker détectée"
    EXPORT_METHOD="docker"
elif pg_isready -h $LOCAL_DB_HOST -p $LOCAL_DB_PORT -U $LOCAL_DB_USER -d $LOCAL_DB_NAME > /dev/null 2>&1; then
    log_info "Base de données PostgreSQL locale détectée"
    EXPORT_METHOD="local"
else
    log_error "Aucune base de données accessible trouvée"
    echo "Vérifiez que PostgreSQL est démarré ou que Docker fonctionne"
    exit 1
fi

# Export selon la méthode détectée
log_info "Export en cours..."

if [ "$EXPORT_METHOD" = "docker" ]; then
    # Export depuis Docker
    docker exec $DOCKER_CONTAINER pg_dump -U $LOCAL_DB_USER -d $LOCAL_DB_NAME --clean --if-exists --create > $EXPORT_DIR/$EXPORT_FILE
    
    # Export des données seulement (sans structure)
    docker exec $DOCKER_CONTAINER pg_dump -U $LOCAL_DB_USER -d $LOCAL_DB_NAME --data-only > $EXPORT_DIR/md_agricole_data_only_${DATE}.sql
    
    # Export de la structure seulement
    docker exec $DOCKER_CONTAINER pg_dump -U $LOCAL_DB_USER -d $LOCAL_DB_NAME --schema-only > $EXPORT_DIR/md_agricole_schema_only_${DATE}.sql
    
elif [ "$EXPORT_METHOD" = "local" ]; then
    # Export depuis PostgreSQL local
    PGPASSWORD=$LOCAL_DB_PASSWORD pg_dump -h $LOCAL_DB_HOST -p $LOCAL_DB_PORT -U $LOCAL_DB_USER -d $LOCAL_DB_NAME --clean --if-exists --create > $EXPORT_DIR/$EXPORT_FILE
    
    # Export des données seulement
    PGPASSWORD=$LOCAL_DB_PASSWORD pg_dump -h $LOCAL_DB_HOST -p $LOCAL_DB_PORT -U $LOCAL_DB_USER -d $LOCAL_DB_NAME --data-only > $EXPORT_DIR/md_agricole_data_only_${DATE}.sql
    
    # Export de la structure seulement
    PGPASSWORD=$LOCAL_DB_PASSWORD pg_dump -h $LOCAL_DB_HOST -p $LOCAL_DB_PORT -U $LOCAL_DB_USER -d $LOCAL_DB_NAME --schema-only > $EXPORT_DIR/md_agricole_schema_only_${DATE}.sql
fi

# Vérifier que l'export a réussi
if [ -f "$EXPORT_DIR/$EXPORT_FILE" ] && [ -s "$EXPORT_DIR/$EXPORT_FILE" ]; then
    EXPORT_SIZE=$(du -h $EXPORT_DIR/$EXPORT_FILE | cut -f1)
    log_success "Export terminé avec succès !"
    log_success "Fichier principal : $EXPORT_DIR/$EXPORT_FILE ($EXPORT_SIZE)"
    
    # Créer un fichier de métadonnées
    cat > $EXPORT_DIR/export_info_${DATE}.txt << EOF
Export MD Agricole - $(date)
============================

Fichiers générés :
- $EXPORT_FILE : Export complet (structure + données)
- md_agricole_data_only_${DATE}.sql : Données seulement
- md_agricole_schema_only_${DATE}.sql : Structure seulement

Base source :
- Host: $LOCAL_DB_HOST
- Port: $LOCAL_DB_PORT  
- Database: $LOCAL_DB_NAME
- User: $LOCAL_DB_USER
- Method: $EXPORT_METHOD

Pour importer sur le VPS :
1. Copiez le fichier sur votre VPS
2. Utilisez le script import-database.sh
3. Ou importez manuellement avec psql

Commande d'import manuel :
psql -h localhost -p 5432 -U md_user -d md_agricole < $EXPORT_FILE
EOF

    log_info "Fichiers générés :"
    ls -lh $EXPORT_DIR/*${DATE}*
    
    echo ""
    log_info "📋 Prochaines étapes :"
    echo "1. Copiez le fichier $EXPORT_FILE sur votre VPS"
    echo "2. Utilisez le script import-database.sh sur le VPS"
    echo "3. Ou importez manuellement avec :"
    echo "   docker-compose exec -T postgres psql -U md_user -d md_agricole < $EXPORT_FILE"
    
else
    log_error "L'export a échoué ou le fichier est vide"
    exit 1
fi

# Compression optionnelle
read -p "Voulez-vous compresser l'export ? (o/n): " -r
if [[ $REPLY =~ ^[Oo]$ ]]; then
    log_info "Compression en cours..."
    tar -czf $EXPORT_DIR/md_agricole_export_${DATE}.tar.gz -C $EXPORT_DIR *${DATE}*
    COMPRESSED_SIZE=$(du -h $EXPORT_DIR/md_agricole_export_${DATE}.tar.gz | cut -f1)
    log_success "Archive créée : md_agricole_export_${DATE}.tar.gz ($COMPRESSED_SIZE)"
fi

echo ""
log_success "🎉 Export terminé avec succès !"
