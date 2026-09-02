# Troubleshooting

**Invalid hook call / duplicate React.** Inspect the federation share scope and lockfile. All participants must share compatible singleton React and React DOM versions; the router and auth package must also be singletons or their contexts will be invisible across boundaries.

**Remote unavailable.** Open its `/health` and `assets/remoteEntry.js`, verify CORS and the configured URL, and inspect the browser network/CSP errors. The shell boundary should show a friendly fallback.

**Incompatible dependency.** Compare `requiredVersion` ranges and deployed lockfiles. Avoid silently accepting a breaking singleton. Roll forward the lagging app or deploy an adapter-compatible major version.

**Stale remote entry.** Do not give `remoteEntry.js` a long immutable cache lifetime. Cache hashed chunks forever, but revalidate the entry/manifest. Purge CDN caches after rollback and avoid deleting old chunks until entry caches have expired.

**Standalone route 404.** Ensure the web server falls back to `index.html` and that the harness `basename` matches its mount path. **Cookie missing:** check origin, `credentials: include`, SameSite/Secure flags, and CORS credentials. **401 loop:** verify API JWT issuer/audience/secret and clock skew. **403:** confirm the demo identity's role and use the unauthorized route rather than retrying.
