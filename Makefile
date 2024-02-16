bash-api:
	docker compose run --no-deps --rm api bash

install:
	npm ci

start:
	heroku local -f Procfile.dev

start-backend:
	npx fastify start -w --verbose-watch --ignore-watch='src dev.sqlite3*' -l info -P server/index.js

start-frontend:
	npx webpack serve

lint-api:
	docker compose run --no-deps --rm api yarn lint

test-api:
	docker compose run --rm api yarn test

test-api-pick:
	docker compose run --rm api yarn test ${name}

test-coverage:
	npm test -- --coverage

migrate:
	npx knex migrate:latest

migration:
	npx knex migrate:make ${name}
