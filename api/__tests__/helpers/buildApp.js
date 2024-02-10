import fastify from 'fastify';
import fp from 'fastify-plugin';
import server from '../../index.js';

export default () => {
  const app = fastify({ exposeHeadRoutes: false });

  app.register(fp(server));

  return app;
};
