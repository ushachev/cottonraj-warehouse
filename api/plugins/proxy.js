import fastifyProxy from '@fastify/http-proxy';
import webpackConfig from '../webpack.config.cjs';

export default async (app) => {
  const { devServer: { port } } = webpackConfig;

  if (app.mode === 'development') {
    app.register(fastifyProxy, {
      upstream: `http://localhost:${port}`,
      prefix: '/assets',
      rewritePrefix: '/assets',
    });
  }
};
