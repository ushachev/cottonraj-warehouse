admin-db:
	docker compose up adminer

bash-api:
	docker compose run --no-deps --rm api bash

bash-web:
	docker compose run --no-deps --rm web bash

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

start-prod:
	docker compose -f compose.yaml up --build

test-api:
	docker compose --profile test --env-file .env.test run --rm api yarn test

test-api-coverage:
	docker compose --profile test --env-file .env.test run --rm api yarn test --coverage

test-api-coverage-ci:
	docker run --rm \
				--volume ./api/coverage:/app/coverage \
				--env FASTIFY_PORT=5000 \
				--env DATABASE_HOST=postgres \
				--env DATABASE_PORT=5432 \
				--env DATABASE_NAME=postgres \
				--env DATABASE_USERNAME=postgres \
				--env DATABASE_PASSWORD=postgres \
				--network=${network} \
				${image} yarn test --coverage

test-api-pick:
	docker compose --profile test --env-file .env.test run --rm api yarn test ${name}
	