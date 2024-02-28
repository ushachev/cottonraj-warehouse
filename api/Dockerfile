FROM node:20.11.0

WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY . .

ENV FASTIFY_ADDRESS=0.0.0.0

CMD [ "yarn", "start"]
