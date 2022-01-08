export default async (app) => {
  const schema = {
    body: {
      type: 'object',
      properties: {
        username: { type: 'string' },
        password: { type: 'string' },
      },
      required: ['username', 'password'],
    },
  };

  app.post('/login', { schema }, async (request) => {
    const { username, password } = request.body;
    const user = username && await app.objection.models.user.query().findOne({ username });

    if (!user?.verifyPassword(password)) {
      return app.httpErrors.unauthorized();
    }

    const token = app.jwt.sign({ username });
    return { token, username };
  });
};
