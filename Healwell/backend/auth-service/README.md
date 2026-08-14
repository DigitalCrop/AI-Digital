# Auth Service

Provides authentication endpoints for the Healwell platform.

Quick start (after installing dependencies and configuring `DATABASE_URL`):

```bash
cd backend/auth-service
npm install
npm run prisma:generate
# set DATABASE_URL then
npm run prisma:migrate
npm run prisma:seed
npm run dev
```
