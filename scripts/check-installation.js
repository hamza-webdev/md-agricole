#!/usr/bin/env node

/**
 * 🔍 Script de vérification de l'installation MD Agricole
 * Ce script vérifie que tous les composants sont correctement installés
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Couleurs pour la console
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkFile(filePath, description) {
  const exists = fs.existsSync(filePath);
  log(`${exists ? '✅' : '❌'} ${description}: ${filePath}`, exists ? 'green' : 'red');
  return exists;
}

function checkCommand(command, description) {
  try {
    execSync(command, { stdio: 'ignore' });
    log(`✅ ${description}`, 'green');
    return true;
  } catch (error) {
    log(`❌ ${description}`, 'red');
    return false;
  }
}

function checkEnvironmentVariable(varName, description) {
  const value = process.env[varName];
  const exists = !!value;
  log(`${exists ? '✅' : '❌'} ${description}: ${varName}`, exists ? 'green' : 'red');
  if (exists && varName !== 'NEXTAUTH_SECRET') {
    log(`    Valeur: ${value}`, 'cyan');
  }
  return exists;
}

async function checkDatabaseConnection() {
  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    await prisma.$connect();
    await prisma.$disconnect();
    
    log('✅ Connexion à la base de données', 'green');
    return true;
  } catch (error) {
    log('❌ Connexion à la base de données', 'red');
    log(`    Erreur: ${error.message}`, 'red');
    return false;
  }
}

async function main() {
  log('\n🔍 Vérification de l\'installation MD Agricole', 'magenta');
  log('=' .repeat(50), 'magenta');

  let allChecksPass = true;

  // Vérification des fichiers essentiels
  log('\n📁 Fichiers de configuration:', 'blue');
  allChecksPass &= checkFile('.env', 'Fichier d\'environnement');
  allChecksPass &= checkFile('package.json', 'Configuration npm');
  allChecksPass &= checkFile('prisma/schema.prisma', 'Schéma Prisma');
  allChecksPass &= checkFile('next.config.js', 'Configuration Next.js');

  // Vérification des dépendances
  log('\n📦 Dépendances:', 'blue');
  allChecksPass &= checkFile('node_modules', 'Modules Node.js installés');
  allChecksPass &= checkFile('node_modules/@prisma/client', 'Client Prisma généré');

  // Vérification des commandes
  log('\n⚙️ Outils requis:', 'blue');
  allChecksPass &= checkCommand('node --version', 'Node.js');
  allChecksPass &= checkCommand('npm --version', 'npm');

  // Vérification des variables d'environnement
  log('\n🌍 Variables d\'environnement:', 'blue');
  
  // Charger le fichier .env s'il existe
  if (fs.existsSync('.env')) {
    const envContent = fs.readFileSync('.env', 'utf8');
    envContent.split('\n').forEach(line => {
      const [key, value] = line.split('=');
      if (key && value) {
        process.env[key] = value.replace(/"/g, '');
      }
    });
  }

  allChecksPass &= checkEnvironmentVariable('DATABASE_URL', 'URL de la base de données');
  allChecksPass &= checkEnvironmentVariable('NEXTAUTH_URL', 'URL NextAuth');
  allChecksPass &= checkEnvironmentVariable('NEXTAUTH_SECRET', 'Clé secrète NextAuth');

  // Vérification de la base de données
  log('\n🗄️ Base de données:', 'blue');
  const dbConnected = await checkDatabaseConnection();
  allChecksPass &= dbConnected;

  // Vérification des ports
  log('\n🌐 Ports:', 'blue');
  try {
    const net = require('net');
    const server = net.createServer();
    
    server.listen(3000, () => {
      log('✅ Port 3000 disponible', 'green');
      server.close();
    });
    
    server.on('error', () => {
      log('⚠️ Port 3000 occupé (normal si l\'app est déjà lancée)', 'yellow');
    });
  } catch (error) {
    log('❌ Erreur lors de la vérification du port 3000', 'red');
  }

  // Résumé
  log('\n📊 Résumé:', 'magenta');
  if (allChecksPass) {
    log('🎉 Toutes les vérifications sont passées avec succès!', 'green');
    log('Vous pouvez démarrer l\'application avec: npm run dev', 'green');
  } else {
    log('⚠️ Certaines vérifications ont échoué.', 'yellow');
    log('Consultez les messages ci-dessus pour résoudre les problèmes.', 'yellow');
  }

  // Suggestions
  log('\n💡 Commandes utiles:', 'cyan');
  log('  npm run dev          - Démarrer en mode développement');
  log('  npx prisma studio    - Ouvrir l\'interface Prisma');
  log('  npx prisma generate  - Régénérer le client Prisma');
  log('  docker ps            - Voir les conteneurs Docker');

  process.exit(allChecksPass ? 0 : 1);
}

// Gestion des erreurs
process.on('unhandledRejection', (error) => {
  log(`❌ Erreur non gérée: ${error.message}`, 'red');
  process.exit(1);
});

// Exécution
main().catch(console.error);
