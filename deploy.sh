#!/bin/bash

# Script de déploiement pour MD Agricole sur VPS
# Usage: ./deploy.sh

set -e  # Arrêter en cas d'erreur

echo "🚀 Début du déploiement de MD Agricole..."

# Couleurs pour les logs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction pour afficher les messages
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

# Vérifier que Docker est installé
if ! command -v docker &> /dev/null; then
    log_error "Docker n'est pas installé. Veuillez l'installer d'abord."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    log_error "Docker Compose n'est pas installé. Veuillez l'installer d'abord."
    exit 1
fi

# Vérifier que le fichier .env.production existe
if [ ! -f ".env.production" ]; then
    log_error "Le fichier .env.production n'existe pas. Veuillez le créer d'abord."
    exit 1
fi

log_info "Arrêt des conteneurs existants..."
docker-compose down --remove-orphans || true

log_info "Suppression des images anciennes..."
docker system prune -f

log_info "Construction des images Docker..."
docker-compose build --no-cache

log_info "Démarrage des services..."
docker-compose --env-file .env.production up -d

log_info "Attente du démarrage de la base de données..."
sleep 10

log_info "Application des migrations Prisma..."
docker-compose exec app npx prisma db push --accept-data-loss

log_info "Génération du client Prisma..."
docker-compose exec app npx prisma generate

log_info "Seeding de la base de données..."
docker-compose exec app npm run db:seed || log_warning "Le seeding a échoué (normal si déjà fait)"

log_info "Vérification de l'état des services..."
docker-compose ps

log_info "Vérification de la santé de l'application..."
sleep 5
if curl -f http://localhost:3007/api/health > /dev/null 2>&1; then
    log_success "Application démarrée avec succès !"
    log_success "🌐 Application accessible sur : http://localhost:3007"
    log_success "🔧 Admin : https://mdagricole.zidani.org/admin"
else
    log_warning "L'application ne répond pas encore. Vérifiez les logs :"
    echo "docker-compose logs app"
fi

log_info "Affichage des logs récents..."
docker-compose logs --tail=20 app

echo ""
log_success "🎉 Déploiement terminé !"
echo ""
echo "📋 Commandes utiles :"
echo "  - Voir les logs : docker-compose logs -f app"
echo "  - Redémarrer : docker-compose restart app"
echo "  - Arrêter : docker-compose down"
echo "  - Mise à jour : ./deploy.sh"
echo ""
echo "🔧 Configuration Nginx :"
echo "  - Copiez nginx-vps.conf vers /etc/nginx/sites-available/mdagricole.zidani.org"
echo "  - Créez le lien : sudo ln -s /etc/nginx/sites-available/mdagricole.zidani.org /etc/nginx/sites-enabled/"
echo "  - Testez : sudo nginx -t"
echo "  - Rechargez : sudo systemctl reload nginx"
echo ""
echo "🔐 SSL avec Let's Encrypt :"
echo "  - sudo certbot --nginx -d mdagricole.zidani.org -d www.mdagricole.zidani.org"
