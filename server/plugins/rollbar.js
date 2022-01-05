import Rollbar from 'rollbar';
import fp from 'fastify-plugin';

const rollbar = new Rollbar({
  accessToken: process.env.SERVER_ROLLBAR_TOKEN,
  captureUncaught: true,
  captureUnhandledRejections: true,
});

export default fp(async (app) => {
  app.decorateRequest('rollbar', function rb(error) {
    if (app.mode !== 'production') return;

    app.log.error(`Error reporting to rollbar, ignoring: ${error.message}`);
    rollbar.error(error, this);
  });
  app.addHook('onError', async (request, _reply, error) => {
    if (app.mode !== 'production') return;

    app.log.error(`Error reporting to rollbar, ignoring: ${error.message}`);
    rollbar.error(error, request);
  });
});
