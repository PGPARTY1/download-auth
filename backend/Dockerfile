FROM node:20-alpine AS base
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY prisma ./prisma
RUN npx prisma generate

COPY tsconfig.json ./
COPY src ./src
RUN npm run build

EXPOSE 4100
ENV NODE_ENV=production

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/src/server.js"]
