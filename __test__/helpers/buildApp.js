import fastify from 'fastify';
import fp from 'fastify-plugin';
import server from '../../server/index.js';

export default () => {
  const app = fastify();

  app.register(fp(server));

  return app;
};
