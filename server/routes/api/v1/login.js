import encrypt from '../../../lib/secure.js';
import testData from '../../../../__fixtures__/testData.js';

const { users: [defaultUser] } = testData;
const users = [{
  username: defaultUser.username,
  verifyPassword: (pwd) => encrypt(pwd) === encrypt(defaultUser.password),
}];

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

  app.post('/login', { schema }, async (request, reply) => {
    const { username, password } = request.body;
    const user = users.find((u) => u.username === username);

    if (!user?.verifyPassword(password)) {
      reply.unauthorized();
    }

    const token = app.jwt.sign({ username });
    return { token, username };
  });
};
