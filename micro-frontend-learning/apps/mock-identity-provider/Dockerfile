FROM node:22-alpine
RUN corepack enable
WORKDIR /repo
COPY . .
RUN pnpm install --frozen-lockfile=false
EXPOSE 4001
CMD ["pnpm","--filter","@mfe/mock-idp","start"]
