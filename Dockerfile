# Dockerfile simple et fonctionnel pour MD Agricole
FROM node:20-alpine

# Définir le répertoire de travail
WORKDIR /app

# Installer les dépendances système
RUN apk add --no-cache libc6-compat

# Copier les fichiers de package
COPY package.json yarn.lock* ./
COPY prisma ./prisma/

# Installer toutes les dépendances
RUN yarn install --frozen-lockfile

# Copier le code source
COPY . .

# Générer le client Prisma
RUN npx prisma generate

# Variables d'environnement
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Construire l'application (sans optimisations problématiques)
RUN yarn build

# Exposer le port
EXPOSE 3000

# Démarrer l'application
CMD ["yarn", "start"]
