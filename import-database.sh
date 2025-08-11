#!/bin/bash

# Script d'import de la base de données MD Agricole sur VPS
# Usage: ./import-database.sh <fichier_export.sql>

set -e

if [ $# -eq 0 ]; then
    echo "❌ Usage: ./import-database.sh <fichier_export.sql>"
    echo "📋 Fichiers SQL disponibles :"
    find . -name "*.sql" -type f 2>/dev/null | head -10 || echo "Aucun fichier SQL trouvé"
    exit 1
fi

IMPORT_FILE=$1
VPS_DB_HOST="localhost"
VPS_DB_PORT="5432"
VPS_DB_NAME="md_agricole"
VPS_DB_USER="md_user"
VPS_DB_PASSWORD="md_secure_password_2024"
DOCKER_CONTAINER="md-agricole-db"

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

echo "📥 Import de la base de données MD Agricole sur VPS"
echo "=================================================="

# Vérifier que le fichier existe
if [ ! -f "$IMPORT_FILE" ]; then
    log_error "Fichier non trouvé : $IMPORT_FILE"
    exit 1
fi

IMPORT_SIZE=$(du -h "$IMPORT_FILE" | cut -f1)
log_info "Fichier à importer : $IMPORT_FILE ($IMPORT_SIZE)"

# Vérifier si c'est une archive
if [[ $IMPORT_FILE == *.tar.gz ]]; then
    log_info "Archive détectée, extraction..."
    tar -xzf "$IMPORT_FILE"
    # Trouver le fichier SQL principal
    IMPORT_FILE=$(find . -name "*export*.sql" -not -name "*data_only*" -not -name "*schema_only*" | head -1)
    if [ -z "$IMPORT_FILE" ]; then
        log_error "Aucun fichier SQL principal trouvé dans l'archive"
        exit 1
    fi
    log_info "Fichier SQL extrait : $IMPORT_FILE"
fi

# Confirmation
echo ""
log_warning "⚠️  ATTENTION : Cette opération va remplacer toutes les données actuelles !"
echo "📁 Fichier source : $IMPORT_FILE"
echo "🎯 Base cible : $VPS_DB_NAME sur $VPS_DB_HOST:$VPS_DB_PORT"
echo ""
read -p "Êtes-vous sûr de vouloir continuer ? (oui/non): " -r
if [[ ! $REPLY =~ ^[Oo][Uu][Ii]$ ]]; then
    echo "Import annulé."
    exit 0
fi

# Vérifier que Docker fonctionne
if ! docker ps | grep -q $DOCKER_CONTAINER; then
    log_error "Le conteneur PostgreSQL n'est pas démarré"
    log_info "Démarrez-le avec : docker-compose up -d postgres"
    exit 1
fi

# Créer une sauvegarde avant import
log_info "Création d'une sauvegarde de sécurité..."
BACKUP_DATE=$(date +%Y%m%d_%H%M%S)
docker exec $DOCKER_CONTAINER pg_dump -U $VPS_DB_USER -d $VPS_DB_NAME > backup_before_import_${BACKUP_DATE}.sql || log_warning "Impossible de créer la sauvegarde (base vide ?)"

# Arrêter l'application pendant l'import
log_info "Arrêt temporaire de l'application..."
docker-compose stop app || true

# Import de la base de données
log_info "Import en cours... (cela peut prendre quelques minutes)"

# Méthode 1 : Import direct (si le fichier contient CREATE DATABASE)
if grep -q "CREATE DATABASE" "$IMPORT_FILE"; then
    log_info "Import avec création de base..."
    docker exec -i $DOCKER_CONTAINER psql -U $VPS_DB_USER -d postgres < "$IMPORT_FILE"
else
    # Méthode 2 : Import dans la base existante
    log_info "Import dans la base existante..."
    docker exec -i $DOCKER_CONTAINER psql -U $VPS_DB_USER -d $VPS_DB_NAME < "$IMPORT_FILE"
fi

# Vérifier l'import
log_info "Vérification de l'import..."
IMPORTED_TABLES=$(docker exec $DOCKER_CONTAINER psql -U $VPS_DB_USER -d $VPS_DB_NAME -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" | tr -d ' ')

if [ "$IMPORTED_TABLES" -gt 0 ]; then
    log_success "Import réussi ! $IMPORTED_TABLES tables importées"
    
    # Statistiques rapides
    log_info "Statistiques de la base importée :"
    docker exec $DOCKER_CONTAINER psql -U $VPS_DB_USER -d $VPS_DB_NAME -c "
        SELECT 
            'users' as table_name, COUNT(*) as count FROM users
        UNION ALL
        SELECT 'products', COUNT(*) FROM products
        UNION ALL
        SELECT 'orders', COUNT(*) FROM orders
        UNION ALL
        SELECT 'invoices', COUNT(*) FROM invoices
        UNION ALL
        SELECT 'categories', COUNT(*) FROM categories;
    " 2>/dev/null || log_warning "Impossible de récupérer les statistiques"
    
else
    log_error "L'import semble avoir échoué (aucune table trouvée)"
    
    # Restaurer la sauvegarde si elle existe
    if [ -f "backup_before_import_${BACKUP_DATE}.sql" ] && [ -s "backup_before_import_${BACKUP_DATE}.sql" ]; then
        log_info "Restauration de la sauvegarde..."
        docker exec -i $DOCKER_CONTAINER psql -U $VPS_DB_USER -d $VPS_DB_NAME < backup_before_import_${BACKUP_DATE}.sql
    fi
    exit 1
fi

# Régénérer le client Prisma
log_info "Régénération du client Prisma..."
docker-compose run --rm app npx prisma generate || log_warning "Impossible de régénérer Prisma"

# Redémarrer l'application
log_info "Redémarrage de l'application..."
docker-compose up -d

# Attendre que l'application soit prête
log_info "Attente du démarrage de l'application..."
sleep 10

# Test de santé
if curl -f -s http://localhost:3007/api/health > /dev/null 2>&1; then
    log_success "Application redémarrée avec succès !"
else
    log_warning "L'application ne répond pas encore, vérifiez les logs :"
    echo "docker-compose logs app"
fi

# Nettoyage
log_info "Nettoyage..."
if [ -f "backup_before_import_${BACKUP_DATE}.sql" ]; then
    mkdir -p backups
    mv backup_before_import_${BACKUP_DATE}.sql backups/
    log_info "Sauvegarde déplacée vers : backups/backup_before_import_${BACKUP_DATE}.sql"
fi

echo ""
log_success "🎉 Import terminé avec succès !"
echo ""
log_info "🌐 Votre application est accessible sur :"
echo "   - Direct : http://localhost:3007"
echo "   - Via Nginx : https://mdagricole.zidani.org"
echo "   - Admin : https://mdagricole.zidani.org/admin"
echo ""
log_info "📋 Vérifiez que tout fonctionne correctement avant de supprimer les fichiers de sauvegarde"
