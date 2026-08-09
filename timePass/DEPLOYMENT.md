# DigitalOcean deployment

This runbook assumes an Ubuntu Droplet that may already host other Docker projects. All timePass resources use the `timepass` prefix. Never stop unrelated containers and never run global Docker cleanup commands.

## GitHub Actions setup

The separate `.github/workflows/timepass-build-deploy.yml` workflow runs only for TimePass changes. Before running it, add repository secrets `DO_HOST`, `DO_USERNAME`, `DO_SSH_KEY`, optional `DO_SSH_PASSPHRASE`, and `TIMEPASS_SESSION_SECRET`. The optional repository variable `TIMEPASS_CLIENT_URL` overrides the public URL; when omitted, it defaults to `http://DO_HOST/timpass`. Set it to `https://YOUR_DOMAIN/timpass`, without a trailing slash, when TLS and a domain are configured. Optional variables `TIMEPASS_HOST` and `TIMEPASS_PORT` default to `127.0.0.1` and `3100`.

The workflow publishes a distinct `<repository>-timepass` image and manages only the `timepass-app` container and `timepass-data` volume. Both application containers join `ai-digital-network`; DayTracker's Nginx remains the only service on port 80 and forwards `/timpass/` to TimePass. The TimePass workflow also keeps `127.0.0.1:3100` for private health checks and rolls back only TimePass if a release is unhealthy.

Push both the DayTracker Nginx/workflow changes and the TimePass changes for the first deployment. The resulting public URLs are `/daytracker/` and `/timpass/` on the same IP or domain. Keep port 3100 private; it does not need a DigitalOcean or UFW inbound rule.

## 1. Prepare the Droplet

Create or reuse an Ubuntu LTS Droplet in DigitalOcean. Add your SSH public key during creation, then connect:

```bash
ssh root@DROPLET_IP
adduser timepassdeploy
usermod -aG sudo timepassdeploy
rsync --archive --chown=timepassdeploy:timepassdeploy ~/.ssh /home/timepassdeploy
ssh timepassdeploy@DROPLET_IP
```

If Docker is not installed, follow Docker's official Ubuntu Engine repository instructions. Install the `docker-ce`, `docker-ce-cli`, `containerd.io`, `docker-buildx-plugin`, and `docker-compose-plugin` packages. Add only the deployment user to the Docker group, then reconnect:

```bash
sudo usermod -aG docker timepassdeploy
exit
ssh timepassdeploy@DROPLET_IP
docker version
docker compose version
```

Do not reinstall Docker when the host already has a working engine.

## 2. Audit the shared host

Read current state before choosing ports:

```bash
docker ps --format 'table {{.Names}}\t{{.Image}}\t{{.Ports}}'
docker network ls
docker volume ls
sudo ss -ltnp
```

Do not stop, rename, or reconfigure anything discovered. If 3100 is occupied, choose an unused high port such as 3177. Never displace a service on ports 80 or 443.

## 3. Install timePass in its own directory

Clone or upload only this project into `/opt/timepass`:

```bash
sudo mkdir -p /opt/timepass
sudo chown timepassdeploy:timepassdeploy /opt/timepass
git clone YOUR_REPOSITORY_URL /opt/timepass
cd /opt/timepass
cp .env.example .env
chmod 600 .env
```

Edit `.env`. Use the private port selected above, the real public URL, and a new secret:

```dotenv
NODE_ENV=production
PORT=3000
TIMEPASS_HOST=127.0.0.1
TIMEPASS_PORT=3100
DATABASE_URL=file:/app/data/timepass.db
APP_DOMAIN=timepass.example.com
CLIENT_URL=https://example.com/timpass
ROOM_EXPIRY_MINUTES=120
RECONNECT_GRACE_SECONDS=60
SESSION_SECRET=PASTE_OUTPUT_FROM_OPENSSL_RAND_BASE64_48
```

Keep the app bound to `127.0.0.1` when using a host reverse proxy.

## 4. Build, migrate, and start only timePass

```bash
cd /opt/timepass
docker compose -p timepass up -d --build
docker compose -p timepass exec timepass-app npm run db:migrate
docker compose -p timepass ps
docker compose -p timepass logs --tail=100 timepass-app
curl --fail http://127.0.0.1:3100/timpass/api/health
```

Startup already runs safe, idempotent deployed migrations; the explicit command verifies them. The expected health response includes `"status":"ok"` and `"database":"ok"`.

Open the private-port URL through an SSH tunnel if needed. Create a room in one browser and join from a private window with a second name. Ready both players, make moves, verify the waiting player cannot act, refresh one session, and confirm it reconnects.

## 5A. Existing proxy already owns 80/443

Do not start the optional Caddy Compose profile. Keep timePass on `127.0.0.1:3100` and add one virtual host to the existing proxy using its normal configuration process.

For Nginx, copy the server block from `deploy/nginx-timepass.conf.example`, replace the domain and private port, test the full configuration, then reload (not restart) Nginx:

```bash
sudo nginx -t
sudo systemctl reload nginx
```

The example forwards `Upgrade` and `Connection` headers required for Socket.IO WebSockets. Add TLS using the certificate mechanism the existing proxy already uses; do not replace other site files or the main configuration.

For an existing Caddy installation, merge only the site block from `deploy/Caddyfile.existing-proxy.example` into its existing Caddyfile, validate, and gracefully reload:

```bash
sudo caddy validate --config /etc/caddy/Caddyfile
sudo systemctl reload caddy
```

Caddy's `reverse_proxy` supports WebSockets automatically.

## 5B. Ports 80/443 are unused

First confirm both ports are free with `sudo ss -ltnp`. Only then start the optional uniquely named Caddy service. Point an A/AAAA DNS record for `APP_DOMAIN` to the Droplet first and allow ports 80/443 in the firewall.

```bash
docker compose -p timepass -f docker-compose.yml -f docker-compose.caddy.yml --profile proxy up -d --build
docker compose -p timepass -f docker-compose.yml -f docker-compose.caddy.yml ps
```

The `timepass-caddy` service obtains certificates, redirects HTTP to HTTPS, and proxies HTTP and Socket.IO WebSockets across `timepass-network`. Its certificate state uses `timepass-caddy-data` and `timepass-caddy-config`; these names do not collide with generic proxy volumes.

## 6. DNS, HTTPS, and verification

Create `timepass.example.com` DNS records at your DNS provider. Verify resolution and HTTPS:

```bash
dig +short timepass.example.com
curl -I https://timepass.example.com
curl --fail https://example.com/timpass/api/health
docker compose -p timepass logs --tail=100 timepass-app
```

Test from two independent browser sessions. In developer tools, the Socket.IO connection should upgrade to WebSocket (polling fallback is also supported). Verify create, join, refresh/reconnect, invalid code, duplicate name, invalid/out-of-turn actions, rematch, and returning to the lobby.

## 7. Future updates

Back up first, then update only this directory and Compose project:

```bash
cd /opt/timepass
git pull --ff-only
docker compose -p timepass up -d --build
docker compose -p timepass exec timepass-app npm run db:migrate
docker compose -p timepass ps
curl --fail http://127.0.0.1:3100/timpass/api/health
```

This recreates only `timepass-app`. Do not use global prune commands.

## 8. SQLite backup and restore

For a consistent online backup, use SQLite's backup command inside a temporary project-scoped container after creating `/opt/timepass/backups`. If the image lacks the SQLite CLI, briefly stop only timePass, then archive the volume with a temporary container:

```bash
mkdir -p /opt/timepass/backups
docker compose -p timepass stop timepass-app
docker run --rm -v timepass-data:/source:ro -v /opt/timepass/backups:/backup alpine tar czf /backup/timepass-$(date +%F-%H%M).tgz -C /source .
docker compose -p timepass start timepass-app
```

Restore only during an announced maintenance window. Inspect the archive and keep the current backup first. Stop only `timepass-app`, then copy a chosen archive into the existing named volume with a temporary container. Do not delete the volume:

```bash
docker compose -p timepass stop timepass-app
docker run --rm -v timepass-data:/restore -v /opt/timepass/backups:/backup alpine sh -c 'cd /restore && tar xzf /backup/CHOSEN_BACKUP.tgz'
docker compose -p timepass start timepass-app
curl --fail http://127.0.0.1:3100/timpass/api/health
```

The restore command overwrites matching database files in `timepass-data`; double-check `CHOSEN_BACKUP.tgz` first.

## 9. Stop without data loss

```bash
docker compose -p timepass down
```

This removes the project containers and network but preserves `timepass-data`. Do not use `down -v`.

## Troubleshooting

- **Port already allocated:** rerun `sudo ss -ltnp`, choose another unused `TIMEPASS_PORT`, and recreate only this Compose project.
- **Docker permission denied:** confirm the deployment user belongs to `docker`, then log out and in. Do not loosen the Docker socket permissions globally.
- **Database permission error:** inspect `docker compose -p timepass logs timepass-app` and `docker volume inspect timepass-data`. The image pre-creates `/app/data` for its non-root user.
- **Unhealthy container:** inspect app logs, run the health URL inside the container, and confirm the migration completed.
- **DNS:** compare `dig` results to the Droplet's current public IP and allow propagation.
- **HTTPS certificate failure:** ensure public DNS resolves correctly and inbound 80/443 reach the active proxy. Confirm there is only one listener on those ports.
- **Socket.IO polling works but WebSocket fails:** ensure Nginx uses HTTP/1.1 plus the `Upgrade` and `Connection` headers, or validate the Caddy site block. Check firewall and CDN WebSocket settings.
- **Invite links use the wrong origin:** set `CLIENT_URL` to the exact public HTTPS origin and recreate `timepass-app`.
- **Rooms disappear after deployment:** expected for active games because they are in memory; completed summaries and scores remain in SQLite.

Run one app replica. Horizontal scaling needs Redis or another shared Socket.IO adapter, shared authoritative live state, and suitable load-balancer configuration; that complexity is intentionally outside this version.
