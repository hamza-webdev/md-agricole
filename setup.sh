#!/bin/bash

# 🚜 Script d'installation MD Agricole
# Ce script automatise l'installation et la configuration de l'application

set -e  # Arrêter en cas d'erreur

echo "🚜 Installation de MD Agricole"
echo "================================"

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction pour afficher les messages colorés
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Vérifier les prérequis
check_prerequisites() {
    print_status "Vérification des prérequis..."
    
    # Vérifier Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js n'est pas installé. Veuillez l'installer depuis https://nodejs.org/"
        exit 1
    fi
    
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        print_error "Node.js version 18+ requis. Version actuelle: $(node -v)"
        exit 1
    fi
    
    print_success "Node.js $(node -v) détecté"
    
    # Vérifier npm/yarn
    if command -v yarn &> /dev/null; then
        PACKAGE_MANAGER="yarn"
        print_success "Yarn détecté"
    elif command -v npm &> /dev/null; then
        PACKAGE_MANAGER="npm"
        print_success "npm détecté"
    else
        print_error "npm ou yarn requis"
        exit 1
    fi
}

# Installer les dépendances
install_dependencies() {
    print_status "Installation des dépendances..."
    
    if [ "$PACKAGE_MANAGER" = "yarn" ]; then
        yarn install
    else
        npm install
    fi
    
    print_success "Dépendances installées"
}

# Configurer l'environnement
setup_environment() {
    print_status "Configuration de l'environnement..."
    
    if [ ! -f ".env" ]; then
        print_status "Création du fichier .env..."
        cat > .env << EOF
# Base de données PostgreSQL
DATABASE_URL="postgresql://md_user:md_password_2024@localhost:5432/md_agricole_db?schema=public"

# NextAuth.js Configuration
NEXTAUTH_URL="http://localhost:3007"
NEXTAUTH_SECRET="$(openssl rand -base64 32 2>/dev/null || echo 'changez-cette-cle-secrete-en-production')"
EOF
        print_success "Fichier .env créé"
    else
        print_warning "Fichier .env existe déjà"
    fi
}

# Configurer PostgreSQL avec Docker
setup_database() {
    print_status "Configuration de la base de données..."
    
    # Vérifier si Docker est disponible
    if command -v docker &> /dev/null; then
        print_status "Docker détecté, configuration de PostgreSQL..."
        
        # Arrêter le conteneur s'il existe
        docker stop md-agricole-db 2>/dev/null || true
        docker rm md-agricole-db 2>/dev/null || true
        
        # Démarrer PostgreSQL
        docker run --name md-agricole-db \
            -e POSTGRES_USER=md_user \
            -e POSTGRES_PASSWORD=md_password_2024 \
            -e POSTGRES_DB=md_agricole_db \
            -p 5432:5432 \
            -d postgres:16-alpine
        
        print_success "PostgreSQL démarré avec Docker"
        
        # Attendre que la base soit prête
        print_status "Attente de la disponibilité de la base de données..."
        sleep 10
        
    else
        print_warning "Docker non détecté. Veuillez installer PostgreSQL manuellement."
        print_status "Instructions:"
        echo "  1. Installer PostgreSQL depuis https://www.postgresql.org/"
        echo "  2. Créer une base de données 'md_agricole_db'"
        echo "  3. Créer un utilisateur 'md_user' avec le mot de passe 'md_password_2024'"
        read -p "Appuyez sur Entrée quand PostgreSQL est configuré..."
    fi
}

# Configurer Prisma
setup_prisma() {
    print_status "Configuration de Prisma..."
    
    # Générer le client Prisma
    npx prisma generate
    print_success "Client Prisma généré"
    
    # Créer les tables
    print_status "Création des tables de base de données..."
    npx prisma db push
    print_success "Tables créées"
    
    # Peupler avec des données de test
    if [ -f "scripts/seed.ts" ]; then
        print_status "Ajout des données de test..."
        npx prisma db seed
        print_success "Données de test ajoutées"
    fi
}

# Démarrer l'application
start_application() {
    print_status "Démarrage de l'application..."
    
    print_success "🎉 Installation terminée avec succès!"
    echo ""
    echo "📋 Prochaines étapes:"
    echo "  1. L'application va démarrer automatiquement"
    echo "  2. Ouvrez http://localhost:3000 dans votre navigateur"
    echo "  3. Consultez le README.md pour plus d'informations"
    echo ""
    
    if [ "$PACKAGE_MANAGER" = "yarn" ]; then
        yarn dev
    else
        npm run dev
    fi
}

# Menu principal
main() {
    echo ""
    echo "Que souhaitez-vous faire ?"
    echo "1) Installation complète (recommandé)"
    echo "2) Installation sans base de données"
    echo "3) Configurer seulement Prisma"
    echo "4) Démarrer l'application"
    echo "5) Quitter"
    echo ""
    read -p "Votre choix (1-5): " choice
    
    case $choice in
        1)
            check_prerequisites
            install_dependencies
            setup_environment
            setup_database
            setup_prisma
            start_application
            ;;
        2)
            check_prerequisites
            install_dependencies
            setup_environment
            print_warning "Base de données non configurée. Configurez PostgreSQL manuellement."
            ;;
        3)
            setup_prisma
            ;;
        4)
            start_application
            ;;
        5)
            print_status "Au revoir!"
            exit 0
            ;;
        *)
            print_error "Choix invalide"
            main
            ;;
    esac
}

# Point d'entrée
main
