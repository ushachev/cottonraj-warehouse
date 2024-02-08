export default async (fastify) => {
  fastify.get('*', (request, reply) => {
    reply.view('index');
  });
};
