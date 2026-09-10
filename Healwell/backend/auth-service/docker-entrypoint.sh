#!/bin/sh
set -e

echo "Running prisma generate..."
npx prisma generate

echo "Applying migrations..."
npx prisma migrate deploy || true

if [ "${NODE_ENV}" = "development" ] || [ "${NODE_ENV}" = "test" ]; then
  echo "Seeding database (if seed script present)..."
  npm run prisma:seed || true
fi

exec "$@"
