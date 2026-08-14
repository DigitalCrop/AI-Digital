# Makefile for common development tasks

.PHONY: install compose-up compose-down auth-migrate auth-migrate-deploy auth-seed prisma-generate dev dev-shell dev-auth dev-auth-service test-auth compose-logs

install:
	npm install

compose-up:
	docker-compose up --build -d

compose-down:
	docker-compose down

compose-logs:
	docker-compose logs -f

prisma-generate:
	cd backend/auth-service && npx prisma generate

auth-migrate:
	cd backend/auth-service && npx prisma migrate dev --name init

auth-migrate-deploy:
	cd backend/auth-service && npx prisma migrate deploy

auth-seed:
	cd backend/auth-service && npm run prisma:seed

dev-auth-service:
	cd backend/auth-service && npm install && npm run dev

dev-auth:
	cd apps/mfe-auth && npm install && npm run dev

dev-shell:
	cd apps/shell && npm install && npm run dev

dev: dev-auth-service dev-auth dev-shell

test-auth:
	cd backend/auth-service && npm test
