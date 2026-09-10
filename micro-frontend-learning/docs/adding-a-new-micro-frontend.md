# Adding a new micro frontend

1. Copy a remote app skeleton, choose a unique federation name and port, and expose one route-root component.
2. Add the workspace package and standalone harness. The harness may supply mock auth; the exposed route must only consume shell auth.
3. Share the exact compatible React, React DOM, router and `@mfe/shared-auth` singleton ranges.
4. Add a shell environment URL, remote declaration, lazy import, top-level route and error boundary.
5. Keep domain state and internal routes inside the new remote. Add a versioned shared contract only when two domains genuinely need it.
6. Add health, Docker, unit/integration and remote-unavailable/E2E coverage. Deploy the remote first, verify its entry, then enable shell routing.

Do not export the remote's entire component tree, introduce a universal store, create a second auth client, or send access tokens through an event.
