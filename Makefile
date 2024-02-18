admin-db:
	docker compose up adminer

bash-api:
	docker compose run --no-deps --rm api bash

bash-web:
	docker compose run --no-deps --rm web bash

install:
	npm ci

lint-api:
	docker compose run --no-deps --rm api yarn lint

lint-web:
	docker compose run --no-deps --rm web yarn lint

migrate:
	docker compose run --rm api ./node_modules/.bin/knex migrate:latest

migration:
	docker compose run --rm --no-deps api ./node_modules/.bin/knex migrate:make ${name}

start:
	docker compose up --build

test-api:
	docker compose --profile test --env-file .env.test run --rm api yarn test

test-api-pick:
	docker compose --profile test --env-file .env.test run --rm api yarn test ${name}

test-coverage:
	npm test -- --coverage
