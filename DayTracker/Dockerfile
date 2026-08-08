# Stage 1: build the Vite React app
FROM node:22-alpine AS builder

WORKDIR /app

# Install dependencies first for better layer caching
COPY package.json package-lock.json ./
RUN npm ci

# Copy source and produce the production build (output: dist/)
COPY . .
RUN npm run build

# Stage 2: serve static assets with Nginx
FROM nginx:1.27-alpine AS production

# Remove default site config; use SPA-friendly config
RUN rm -f /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy only the built assets (no node_modules, no source)
COPY --from=builder /app/dist /usr/share/nginx/html/daytracker

# Non-root friendly: nginx alpine already runs workers as nginx user
EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://127.0.0.1/daytracker/health || exit 1

CMD ["nginx", "-g", "daemon off;"]
