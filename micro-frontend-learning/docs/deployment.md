# Deployment

Each app has its own Dockerfile and health endpoint. Run all services with `docker compose up --build`. In production, publish each static app independently, use immutable hashed chunks, serve `remoteEntry.js` with `no-store` or rapid revalidation, and use HTTPS/CSP/CORS allowlists.

Set `VITE_PRODUCTS_REMOTE_URL`, `VITE_ORDERS_REMOTE_URL`, `VITE_API_URL`, and `VITE_IDENTITY_URL` per environment before builds. Promote compatible remote versions independently. For zero shell rebuilds when origins change, replace build-time Vite values with a deployment-generated `/config.json` or federation manifest fetched before React bootstrap.

Use readiness checks in the orchestrator. A failed remote leaves shell navigation/auth available and displays its local fallback. Roll back the remote deployment rather than the shell unless their shared dependency contract is incompatible.
