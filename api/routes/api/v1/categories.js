export default async (app) => {
  const { models } = app.objection;
  const schema = {
    body: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        parentId: { type: ['integer', 'null'] },
      },
      required: ['name'],
    },
  };

  app
    .get('/categories', { name: 'categories' }, async () => {
      const categories = await models.category.query()
        .modify(['defaultSelects', 'orderByName'])
        .withGraphFetched('children(idSelects, orderByName)');

      return {
        categories: categories.map(({ children, ...categoryData }) => ({
          ...categoryData,
          children: children.map(({ id }) => id),
        })),
      };
    })
    .post('/categories', { schema }, async (request, reply) => {
      try {
        const category = await models.category.query().insert(request.body);

        reply.code(201);

        return { category };
      } catch (error) {
        if (error.type !== 'ModelValidation') {
          return error;
        }

        reply.code(422);

        return { errors: error.data };
      }
    })
    .patch('/categories/:id', { name: 'category' }, async (request, reply) => {
      const category = await models.category.query().findById(request.params.id);

      try {
        await category.$query().patch(request.body);
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
