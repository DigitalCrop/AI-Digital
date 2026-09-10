# Micro-frontend learning workspace

A small production-shaped React monorepo demonstrating runtime Module Federation, shell-owned authentication, independent feature routing, failure isolation, and explicit contracts.

## Quick start

Prerequisites: Node 22+ and pnpm 10 (or `corepack enable`).

```bash
pnpm install
pnpm dev
```

Open <http://localhost:3000>. Demo identities are `viewer@example.com` (`viewer`) and `admin@example.com` (`admin`). The selector intentionally has no password because it is a local teaching IdP.

| Service      | Port | Purpose                                        |
| ------------ | ---: | ---------------------------------------------- |
| shell        | 3000 | layout, navigation, auth and remote loading    |
| products     | 3001 | product remote and standalone harness          |
| orders       | 3002 | order remote and standalone harness            |
| mock API     | 4000 | authenticated `/v1` API                        |
| mock IdP/BFF | 4001 | HttpOnly session and short-lived token minting |

Commands: `pnpm typecheck`, `pnpm test`, `pnpm build`, `pnpm test:e2e`, and `docker compose up --build`. Copy each `.env.example` to `.env` when overriding defaults.

## Learning path

Read in this order: `docs/architecture.md`; `packages/shared-auth/src/index.tsx`; `apps/shell-app/src/App.tsx`; each remote's `vite.config.ts` and `src/Routes.tsx`; the two mock servers; integration and E2E tests; then deployment/troubleshooting docs.

This is a learning implementation. Production replaces the mock login endpoint with an OIDC Authorization Code + PKCE redirect and typically keeps tokens server-side in a BFF while preserving the same `AuthContextValue` contract.
