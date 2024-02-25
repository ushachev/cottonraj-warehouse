export default async (app, user) => {
  const response = await app.inject({
    method: 'POST',
    url: app.reverse('login'),
    payload: user,
  });
  const { token } = response.json();

  return token;
};
