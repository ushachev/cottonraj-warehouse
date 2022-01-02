import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import autoLoad from 'fastify-autoload';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default async (fastify, _options) => {
  fastify.register(autoLoad, {
    dir: join(__dirname, 'plugins'),
  });

  fastify.register(autoLoad, {
    dir: join(__dirname, 'routes'),
  });
};
