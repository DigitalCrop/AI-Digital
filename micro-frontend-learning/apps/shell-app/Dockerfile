FROM node:22-alpine AS build
RUN corepack enable
WORKDIR /repo
COPY . .
RUN pnpm install --frozen-lockfile=false && pnpm --filter @mfe/shell build
FROM nginx:1.27-alpine
COPY packages/tooling/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /repo/apps/shell-app/dist /usr/share/nginx/html
