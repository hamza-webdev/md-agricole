#!/bin/bash

# Script de monitoring pour MD Agricole
# Usage: ./monitor.sh

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

echo "🔍 Monitoring MD Agricole - $(date)"
echo "=================================="

# 1. Vérifier l'état des conteneurs Docker
log_info "État des conteneurs Docker :"
docker-compose ps

# 2. Vérifier l'utilisation des ressources
log_info "Utilisation des ressources :"
docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}\t{{.BlockIO}}"

# 3. Vérifier la connectivité de l'application
log_info "Test de connectivité de l'application :"
if curl -f -s http://localhost:3007/api/health > /dev/null; then
    log_success "Application accessible sur le port 3007"
else
    log_error "Application non accessible sur le port 3007"
fi

# 4. Vérifier la connectivité via Nginx
log_info "Test de connectivité via Nginx :"
if curl -f -s -k https://mdagricole.zidani.org/api/health > /dev/null; then
    log_success "Application accessible via Nginx"
else
    log_warning "Application non accessible via Nginx (vérifiez la configuration)"
fi

# 5. Vérifier l'espace disque
log_info "Espace disque :"
df -h | grep -E "(Filesystem|/dev/)"

# 6. Vérifier les logs récents
log_info "Logs récents de l'application :"
docker-compose logs --tail=5 app

# 7. Vérifier la base de données
log_info "Test de connectivité à la base de données :"
if docker-compose exec -T postgres pg_isready -U md_user -d md_agricole > /dev/null 2>&1; then
    log_success "Base de données accessible"
    
    # Statistiques de la base
    log_info "Statistiques de la base de données :"
    docker-compose exec -T postgres psql -U md_user -d md_agricole -c "
        SELECT 
            'Utilisateurs' as table_name, COUNT(*) as count FROM users
        UNION ALL
        SELECT 'Produits', COUNT(*) FROM products
        UNION ALL
        SELECT 'Commandes', COUNT(*) FROM orders
        UNION ALL
        SELECT 'Factures', COUNT(*) FROM invoices;
    " 2>/dev/null || log_warning "Impossible de récupérer les statistiques"
else
    log_error "Base de données non accessible"
fi

# 8. Vérifier les certificats SSL
log_info "Certificats SSL :"
if [ -f "/etc/letsencrypt/live/mdagricole.zidani.org/fullchain.pem" ]; then
    CERT_EXPIRY=$(openssl x509 -enddate -noout -in /etc/letsencrypt/live/mdagricole.zidani.org/fullchain.pem | cut -d= -f2)
    log_success "Certificat SSL valide jusqu'au : $CERT_EXPIRY"
else
    log_warning "Certificat SSL non trouvé"
fi

# 9. Vérifier l'état de Nginx
log_info "État de Nginx :"
if systemctl is-active --quiet nginx; then
    log_success "Nginx actif"
else
    log_error "Nginx inactif"
fi

echo ""
echo "=================================="
log_info "Monitoring terminé - $(date)"

# 10. Résumé des URLs importantes
echo ""
log_info "🌐 URLs importantes :"
echo "   - Site web : https://mdagricole.zidani.org"
echo "   - Admin : https://mdagricole.zidani.org/admin"
echo "   - API Health : https://mdagricole.zidani.org/api/health"
echo "   - Direct (test) : http://localhost:3007"
