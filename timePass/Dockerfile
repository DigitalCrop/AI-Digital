FROM node:22-alpine AS dependencies
WORKDIR /app
COPY package.json package-lock.json ./
COPY client/package.json client/package.json
COPY server/package.json server/package.json
COPY shared/package.json shared/package.json
RUN npm ci

FROM dependencies AS build
COPY . .
RUN npm run db:generate && npm run build

FROM node:22-alpine AS production
ENV NODE_ENV=production PORT=3000 DATABASE_URL=file:/app/data/timepass.db
WORKDIR /app
COPY package.json package-lock.json ./
COPY client/package.json client/package.json
COPY server/package.json server/package.json
COPY shared/package.json shared/package.json
RUN npm ci --omit=dev && npm cache clean --force
COPY --from=build /app/node_modules/.prisma /app/node_modules/.prisma
COPY --from=build /app/client/dist /app/client/dist
COPY server/src server/src
COPY server/prisma server/prisma
COPY shared/src shared/src
RUN mkdir -p /app/data && chown -R node:node /app
USER node
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 CMD wget -qO- http://127.0.0.1:3000/timepass/api/health || exit 1
CMD ["sh", "-c", "npm run db:migrate && npm start"]
