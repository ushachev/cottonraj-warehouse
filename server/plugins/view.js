import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import fp from 'fastify-plugin';
import fastifyView from '@fastify/view';
import pug from 'pug';
import webpackConfig from '../../webpack.config.cjs';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default fp(async (app) => {
  const { devServer: { port } } = webpackConfig;
  const devHost = `http://localhost:${port}`;
  const domain = app.mode === 'development' ? devHost : '';

  app.register(fastifyView, {
    engine: { pug },
    includeViewExtension: true,
    root: join(__dirname, '..', 'views'),
    defaultContext: {
      getAssetPath: (filename) => `${domain}/assets/${filename}`,
    },
  });
});
