#!/bin/bash

# Script de build personnalisé pour éviter les problèmes de Prisma

echo "🔧 Génération du client Prisma..."
npx prisma generate

echo "🏗️ Construction de l'application Next.js..."
# Définir des variables d'environnement temporaires pour le build
export DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy"
export NEXTAUTH_SECRET="build-secret"
export NEXTAUTH_URL="http://localhost:3000"

# Construire l'application
next build

echo "✅ Build terminé avec succès!"
