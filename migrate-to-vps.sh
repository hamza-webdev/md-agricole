#!/bin/bash

# Script de migration directe de la base locale vers VPS
# Usage: ./migrate-to-vps.sh <IP_VPS> [<utilisateur_vps>]

set -e

if [ $# -eq 0 ]; then
    echo "❌ Usage: ./migrate-to-vps.sh <IP_VPS> [<utilisateur_vps>]"
    echo "📋 Exemple: ./migrate-to-vps.sh 192.168.1.100 root"
    exit 1
fi

VPS_IP=$1
VPS_USER=${2:-root}
VPS_PATH="/opt/md-agricole"

# Configuration locale
LOCAL_DB_CONTAINER="md_agricole_db"
LOCAL_DB_NAME="md_agricole_db"
LOCAL_DB_USER="md_user"

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

echo "🚀 Migration MD Agricole : Local → VPS"
echo "======================================"
echo "🎯 VPS cible : $VPS_USER@$VPS_IP"
echo "📁 Chemin VPS : $VPS_PATH"
echo ""

# Vérifications préliminaires
log_info "Vérifications préliminaires..."

# Vérifier Docker local
if ! docker ps | grep -q $LOCAL_DB_CONTAINER; then
    log_error "Base de données locale non démarrée"
    echo "Démarrez-la avec : docker-compose up -d"
    exit 1
fi

# Vérifier la connectivité SSH
if ! ssh -o ConnectTimeout=5 $VPS_USER@$VPS_IP "echo 'SSH OK'" > /dev/null 2>&1; then
    log_error "Impossible de se connecter au VPS via SSH"
    echo "Vérifiez : ssh $VPS_USER@$VPS_IP"
    exit 1
fi

log_success "Vérifications OK"

# Confirmation
echo ""
log_warning "⚠️  Cette opération va :"
echo "1. Exporter la base locale"
echo "2. Copier l'export sur le VPS"
echo "3. Importer dans la base VPS (remplace les données existantes)"
echo ""
read -p "Continuer ? (oui/non): " -r
if [[ ! $REPLY =~ ^[Oo][Uu][Ii]$ ]]; then
    echo "Migration annulée."
    exit 0
fi

# 1. Export local
DATE=$(date +%Y%m%d_%H%M%S)
EXPORT_FILE="migration_${DATE}.sql"

log_info "1/4 - Export de la base locale..."
docker exec $LOCAL_DB_CONTAINER pg_dump -U $LOCAL_DB_USER -d $LOCAL_DB_NAME --clean --if-exists > $EXPORT_FILE

if [ ! -s "$EXPORT_FILE" ]; then
    log_error "L'export local a échoué"
    exit 1
fi

EXPORT_SIZE=$(du -h $EXPORT_FILE | cut -f1)
log_success "Export local terminé : $EXPORT_FILE ($EXPORT_SIZE)"

# 2. Copie vers VPS
log_info "2/4 - Copie vers le VPS..."
scp $EXPORT_FILE $VPS_USER@$VPS_IP:$VPS_PATH/

if [ $? -eq 0 ]; then
    log_success "Fichier copié sur le VPS"
else
    log_error "Échec de la copie vers le VPS"
    exit 1
fi

# 3. Import sur VPS
log_info "3/4 - Import sur le VPS..."
ssh $VPS_USER@$VPS_IP "cd $VPS_PATH && chmod +x import-database.sh && echo 'oui' | ./import-database.sh $EXPORT_FILE"

if [ $? -eq 0 ]; then
    log_success "Import sur VPS terminé"
else
    log_error "Échec de l'import sur VPS"
    exit 1
fi

# 4. Vérification
log_info "4/4 - Vérification..."
VPS_HEALTH=$(ssh $VPS_USER@$VPS_IP "curl -f -s http://localhost:3007/api/health" 2>/dev/null || echo "FAILED")

if [[ $VPS_HEALTH == *"healthy"* ]]; then
    log_success "Application VPS fonctionne correctement"
else
    log_warning "L'application VPS ne répond pas encore"
    echo "Vérifiez les logs : ssh $VPS_USER@$VPS_IP 'cd $VPS_PATH && docker-compose logs app'"
fi

# Nettoyage local
log_info "Nettoyage..."
rm -f $EXPORT_FILE

# Nettoyage VPS (optionnel)
read -p "Supprimer le fichier d'export du VPS ? (o/n): " -r
if [[ $REPLY =~ ^[Oo]$ ]]; then
    ssh $VPS_USER@$VPS_IP "rm -f $VPS_PATH/$EXPORT_FILE"
    log_info "Fichier d'export supprimé du VPS"
fi

echo ""
log_success "🎉 Migration terminée avec succès !"
echo ""
log_info "🌐 Votre application est maintenant accessible sur :"
echo "   - https://mdagricole.zidani.org"
echo "   - https://mdagricole.zidani.org/admin"
echo ""
log_info "📋 Commandes utiles sur le VPS :"
echo "   - Logs : ssh $VPS_USER@$VPS_IP 'cd $VPS_PATH && docker-compose logs -f app'"
echo "   - Monitoring : ssh $VPS_USER@$VPS_IP 'cd $VPS_PATH && ./monitor.sh'"
echo "   - Redémarrer : ssh $VPS_USER@$VPS_IP 'cd $VPS_PATH && docker-compose restart app'"
