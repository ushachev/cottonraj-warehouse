import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import fastifyStatic from '@fastify/static';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default async (app) => {
  app.register(fastifyStatic, {
    root: join(__dirname, '..', '..', 'dist', 'public'),
    prefix: '/assets',
    wildcard: false,
  });
};
