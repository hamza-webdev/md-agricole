# 🚜 Script d'installation MD Agricole pour Windows PowerShell
# Ce script automatise l'installation et la configuration de l'application

param(
    [switch]$SkipDatabase,
    [switch]$PrismaOnly,
    [switch]$StartOnly
)

# Configuration des couleurs
$Host.UI.RawUI.ForegroundColor = "White"

function Write-Status {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Blue
}

function Write-Success {
    param([string]$Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

function Check-Prerequisites {
    Write-Status "Vérification des prérequis..."
    
    # Vérifier Node.js
    try {
        $nodeVersion = node --version
        $versionNumber = [int]($nodeVersion -replace 'v(\d+)\..*', '$1')
        
        if ($versionNumber -lt 18) {
            Write-Error "Node.js version 18+ requis. Version actuelle: $nodeVersion"
            exit 1
        }
        
        Write-Success "Node.js $nodeVersion détecté"
    }
    catch {
        Write-Error "Node.js n'est pas installé. Téléchargez-le depuis https://nodejs.org/"
        exit 1
    }
    
    # Vérifier npm/yarn
    try {
        yarn --version | Out-Null
        $script:PackageManager = "yarn"
        Write-Success "Yarn détecté"
    }
    catch {
        try {
            npm --version | Out-Null
            $script:PackageManager = "npm"
            Write-Success "npm détecté"
        }
        catch {
            Write-Error "npm ou yarn requis"
            exit 1
        }
    }
}

function Install-Dependencies {
    Write-Status "Installation des dépendances..."
    
    if ($script:PackageManager -eq "yarn") {
        yarn install
    } else {
        npm install
    }
    
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Dépendances installées"
    } else {
        Write-Error "Erreur lors de l'installation des dépendances"
        exit 1
    }
}

function Setup-Environment {
    Write-Status "Configuration de l'environnement..."
    
    if (-not (Test-Path ".env")) {
        Write-Status "Création du fichier .env..."
        
        # Générer une clé secrète aléatoire
        $secretKey = [System.Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes([System.Guid]::NewGuid().ToString()))
        
        $envContent = @"
# Base de données PostgreSQL
DATABASE_URL="postgresql://md_user:md_password_2024@localhost:5432/md_agricole_db?schema=public"

# NextAuth.js Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="$secretKey"
"@
        
        $envContent | Out-File -FilePath ".env" -Encoding UTF8
        Write-Success "Fichier .env créé"
    } else {
        Write-Warning "Fichier .env existe déjà"
    }
}

function Setup-Database {
    Write-Status "Configuration de la base de données..."
    
    # Vérifier si Docker est disponible
    try {
        docker --version | Out-Null
        Write-Status "Docker détecté, configuration de PostgreSQL..."
        
        # Arrêter le conteneur s'il existe
        docker stop md-agricole-db 2>$null
        docker rm md-agricole-db 2>$null
        
        # Démarrer PostgreSQL
        docker run --name md-agricole-db `
            -e POSTGRES_USER=md_user `
            -e POSTGRES_PASSWORD=md_password_2024 `
            -e POSTGRES_DB=md_agricole_db `
            -p 5432:5432 `
            -d postgres:16-alpine
        
        if ($LASTEXITCODE -eq 0) {
            Write-Success "PostgreSQL démarré avec Docker"
            
            # Attendre que la base soit prête
            Write-Status "Attente de la disponibilité de la base de données..."
            Start-Sleep -Seconds 10
        } else {
            Write-Error "Erreur lors du démarrage de PostgreSQL"
            exit 1
        }
    }
    catch {
        Write-Warning "Docker non détecté. Configuration manuelle requise."
        Write-Host ""
        Write-Host "Instructions pour installer PostgreSQL:" -ForegroundColor Cyan
        Write-Host "  1. Télécharger depuis https://www.postgresql.org/download/windows/"
        Write-Host "  2. Installer avec les paramètres par défaut"
        Write-Host "  3. Créer une base 'md_agricole_db'"
        Write-Host "  4. Créer un utilisateur 'md_user' avec le mot de passe 'md_password_2024'"
        Write-Host ""
        Read-Host "Appuyez sur Entrée quand PostgreSQL est configuré"
    }
}

function Setup-Prisma {
    Write-Status "Configuration de Prisma..."
    
    # Générer le client Prisma
    npx prisma generate
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Client Prisma généré"
    } else {
        Write-Error "Erreur lors de la génération du client Prisma"
        exit 1
    }
    
    # Créer les tables
    Write-Status "Création des tables de base de données..."
    npx prisma db push
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Tables créées"
    } else {
        Write-Error "Erreur lors de la création des tables"
        exit 1
    }
    
    # Peupler avec des données de test
    if (Test-Path "scripts/seed.ts") {
        Write-Status "Ajout des données de test..."
        npx prisma db seed
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Données de test ajoutées"
        }
    }
}

function Start-Application {
    Write-Status "Démarrage de l'application..."
    
    Write-Success "🎉 Installation terminée avec succès!"
    Write-Host ""
    Write-Host "📋 Prochaines étapes:" -ForegroundColor Cyan
    Write-Host "  1. L'application va démarrer automatiquement"
    Write-Host "  2. Ouvrez http://localhost:3000 dans votre navigateur"
    Write-Host "  3. Consultez le README.md pour plus d'informations"
    Write-Host ""
    
    if ($script:PackageManager -eq "yarn") {
        yarn dev
    } else {
        npm run dev
    }
}

function Show-Menu {
    Write-Host ""
    Write-Host "🚜 Installation de MD Agricole" -ForegroundColor Green
    Write-Host "================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Que souhaitez-vous faire ?"
    Write-Host "1) Installation complète (recommandé)"
    Write-Host "2) Installation sans base de données"
    Write-Host "3) Configurer seulement Prisma"
    Write-Host "4) Démarrer l'application"
    Write-Host "5) Quitter"
    Write-Host ""
    
    $choice = Read-Host "Votre choix (1-5)"
    
    switch ($choice) {
        "1" {
            Check-Prerequisites
            Install-Dependencies
            Setup-Environment
            Setup-Database
            Setup-Prisma
            Start-Application
        }
        "2" {
            Check-Prerequisites
            Install-Dependencies
            Setup-Environment
            Write-Warning "Base de données non configurée. Configurez PostgreSQL manuellement."
        }
        "3" {
            Setup-Prisma
        }
        "4" {
            Start-Application
        }
        "5" {
            Write-Status "Au revoir!"
            exit 0
        }
        default {
            Write-Error "Choix invalide"
            Show-Menu
        }
    }
}

# Point d'entrée principal
if ($PrismaOnly) {
    Setup-Prisma
} elseif ($StartOnly) {
    Start-Application
} elseif ($SkipDatabase) {
    Check-Prerequisites
    Install-Dependencies
    Setup-Environment
} else {
    Show-Menu
}
