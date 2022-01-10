install:
	npm ci

start:
	heroku local -f Procfile.dev

start-backend:
	npx fastify start -w --verbose-watch --ignore-watch='src' -l info -P server/index.js

start-frontend:
	npx webpack serve

lint:
	npx eslint . --ext js,jsx

test:
	npm test

test-coverage:
	npm test -- --coverage

migrate:
	npx knex migrate:latest

migration:
	npx knex migrate:make ${name}
