FROM node:18-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json* ./
COPY prisma ./prisma
COPY src ./src
RUN npm ci --production=false
RUN npx prisma generate
RUN npm run build

FROM node:18-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/dist ./dist
COPY package.json package-lock.json* ./
RUN npm ci --production
COPY prisma ./prisma
COPY .env.example ./
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh
EXPOSE 4000
ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
CMD ["node", "dist/server.js"]
