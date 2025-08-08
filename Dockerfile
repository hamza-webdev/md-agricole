FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache libc6-compat

COPY package.json yarn.lock* ./
COPY prisma ./prisma/

RUN yarn install --frozen-lockfile

COPY . .

# Générer Prisma (pas besoin de DB pour ça)
RUN npx prisma generate

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

RUN yarn build

EXPOSE 3000

CMD ["yarn", "start"]

