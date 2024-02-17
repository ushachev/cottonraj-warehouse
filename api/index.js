import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import autoLoad from '@fastify/autoload';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default async (fastify, _options) => {
  const mode = process.env.NODE_ENV ?? 'development';
  fastify.decorate('mode', mode);

  fastify.register(autoLoad, {
    dir: join(__dirname, 'plugins'),
  });

  fastify.register(autoLoad, {
    dir: join(__dirname, 'routes'),
    autoHooks: true,
    cascadeHooks: true,
  });
};

export const options = {
  exposeHeadRoutes: false,
};
