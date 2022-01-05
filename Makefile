install:
	npm ci

start-backend:
	npx fastify start -w -l info -P server/index.js

lint:
	npx eslint .

test:
	npm test

test-coverage:
	npm test -- --coverage
