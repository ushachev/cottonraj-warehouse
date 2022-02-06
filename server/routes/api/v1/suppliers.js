export default async (app) => {
  const { models } = app.objection;
  const schema = {
    body: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        shortName: { type: 'string' },
      },
      required: ['name'],
    },
  };

  app
    .get('/suppliers', { name: 'suppliers' }, async () => {
      const suppliers = await models.supplier.query();
      return { suppliers };
    })
    .post('/suppliers', { schema }, async (request, reply) => {
      try {
        const supplier = models.supplier.fromJson(request.body);

        await models.supplier.query().insert(supplier);
        reply.code(201);

        return { supplier };
      } catch (error) {
        if (error.type !== 'ModelValidation') {
          return error;
        }

        reply.code(422);

        return { errors: error.data };
      }
    })
    .patch('/suppliers/:id', { name: 'supplier', schema }, async (request, reply) => {
      console.dir(request.headers);
      const supplier = await models.supplier.query().findById(request.params.id);

      try {
        await supplier.$query().patch(request.body);
        reply.code(204);

        return null;
      } catch (error) {
        if (error.type !== 'ModelValidation') {
          return error;
        }

        reply.code(422);

        return { errors: error.data };
      }
    });
};
