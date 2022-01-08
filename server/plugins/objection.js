import fp from 'fastify-plugin';
import fastifyObjectionjs from 'fastify-objectionjs';
import knexConfig from '../../knexfile.js';
import models from '../models/index.js';

export default fp(async (app) => {
  app.register(fastifyObjectionjs, {
    knexConfig: knexConfig[app.mode],
    models,
  });
});
