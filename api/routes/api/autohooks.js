export default async (app) => {
  app.addHook('preValidation', async (request, reply) => {
    try {
      await request.jwtVerify();

      const { username } = request.user;
      const user = await app.objection.models.user.query().findOne({ username });

      if (!user) {
        reply.unauthorized();
      }
    } catch (_err) {
      reply.unauthorized();
    }
  });
};
