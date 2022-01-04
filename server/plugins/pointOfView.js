import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import fp from 'fastify-plugin';
import pointOfView from 'point-of-view';
import pug from 'pug';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default fp(async (fastify) => {
  fastify.register(pointOfView, {
    engine: { pug },
    includeViewExtension: true,
    root: join(__dirname, '..', 'views'),
  });
});
