#!/usr/bin/env bash
# Deploy DayTracker on a DigitalOcean droplet (or any Docker host).
# Usage:
#   IMAGE=ghcr.io/digitalcrop/ai-digital:latest ./deploy.sh
#   IMAGE=ghcr.io/digitalcrop/ai-digital:abc1234 ./deploy.sh   # pin a SHA tag

set -euo pipefail

IMAGE="${IMAGE:-ghcr.io/digitalcrop/ai-digital:latest}"
CONTAINER_NAME="${CONTAINER_NAME:-daytracker}"
HOST_PORT="${HOST_PORT:-80}"
CONTAINER_PORT="${CONTAINER_PORT:-80}"
SHARED_NETWORK="${SHARED_NETWORK:-ai-digital-network}"

echo "==> Pulling image: ${IMAGE}"
docker pull "${IMAGE}"
docker network create "${SHARED_NETWORK}" >/dev/null 2>&1 || true

echo "==> Stopping existing container (if any): ${CONTAINER_NAME}"
docker stop "${CONTAINER_NAME}" 2>/dev/null || true

echo "==> Removing existing container (if any): ${CONTAINER_NAME}"
docker rm "${CONTAINER_NAME}" 2>/dev/null || true

echo "==> Starting new container"
docker run -d \
  --name "${CONTAINER_NAME}" \
  --network "${SHARED_NETWORK}" \
  -p "${HOST_PORT}:${CONTAINER_PORT}" \
  --restart always \
  "${IMAGE}"

echo "==> Waiting for health endpoint"
ATTEMPTS=12
SLEEP_SECONDS=2
for i in $(seq 1 "${ATTEMPTS}"); do
  if curl -fsS "http://127.0.0.1:${HOST_PORT}/daytracker/" >/dev/null 2>&1; then
    echo "==> Health check passed"
    docker ps --filter "name=${CONTAINER_NAME}"
    exit 0
  fi
  echo "    attempt ${i}/${ATTEMPTS} — not ready yet"
  sleep "${SLEEP_SECONDS}"
done

echo "==> Health check failed. Recent logs:"
docker logs --tail 50 "${CONTAINER_NAME}" || true
exit 1
