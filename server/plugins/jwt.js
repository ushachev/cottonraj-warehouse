import crypto from 'crypto';
import fp from 'fastify-plugin';
import fastifyJWT from 'fastify-jwt';

export default fp(async (app) => {
  app.register(fastifyJWT, {
    secret: crypto.randomBytes(32).toString('hex'),
  });
});
