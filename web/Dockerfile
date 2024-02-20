FROM node:20.11.0 AS development

WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY . .

CMD [ "yarn", "start" ]

FROM development AS build

RUN yarn build

FROM caddy:2.7.6

COPY .caddy/Caddyfile /etc/caddy/

COPY --from=build /app/build .
