import fp from 'fastify-plugin';
import fastifyReverseRoutes from 'fastify-reverse-routes';

export default fp(async (app) => {
  app.register(fastifyReverseRoutes.plugin);
});
