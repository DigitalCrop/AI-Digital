# Authentication and session flow

```mermaid
sequenceDiagram
  actor User
  participant Shell
  participant IdP as IdP/BFF
  participant Auth as shared-auth
  participant Remote
  participant API
  User->>Shell: Select demo identity
  Shell->>IdP: POST /session/login
  IdP-->>Shell: HttpOnly SameSite cookie + user
  Shell->>Auth: Update one React context
  Auth-->>Remote: Immediate shared user update
  Remote->>IdP: GET /session/token with cookie
  IdP-->>Remote: Short-lived access token
  Remote->>API: Bearer token + correlation ID
  API-->>Remote: 200 / 401 / 403
  User->>Shell: Logout
  Shell->>IdP: Delete server session
  Shell->>Auth: user = null
  Auth-->>Remote: Immediate logout
```

Only the shell creates `AuthProvider`; federation ensures remotes import that same package instance. Remotes request tokens through `getAccessToken()` and never receive them through props, URLs or events. A 401 triggers session recovery; a 403 routes to `/unauthorized`.

Production uses OIDC Authorization Code Flow with PKCE. Prefer a BFF that exchanges the code, stores refresh/access tokens server-side, and exposes only a Secure, HttpOnly, SameSite session cookie. `localStorage` is readable by injected JavaScript, so an XSS can exfiltrate long-lived credentials. The demo returns a five-minute token to memory solely to make API mechanics visible.
