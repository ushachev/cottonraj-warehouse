export default async (app) => {
  const { models } = app.objection;
  const schema = {
    body: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        shortName: { type: 'string' },
        barcodes: {
          type: 'array',
          uniqueItems: true,
          items: { type: 'string' },
        },
      },
      required: ['name'],
    },
  };

  app
    .get('/products', { name: 'products' }, async () => {
      const products = await models.product.query()
        .modify(['orderByName'])
        .withGraphJoined('barcodes(defaultSelects)');

      return {
        products: products.map(({ barcodes, ...productData }) => ({
          ...productData,
          barcodes: barcodes.map(({ value }) => value),
        })),
      };
    })
    .post('/products', { schema }, async (request, reply) => {
      const { barcodes, ...productData } = request.body;

      try {
        const product = { ...productData, barcodes };

        reply.code(201);

        return { product };
      } catch (error) {
        if (error.type !== 'ModelValidation') {
          return error;
        }

        reply.code(422);

        return { errors: error.data };
      }
    })
    .patch('/products/:id', { name: 'product' }, async (request, reply) => {
      const product = await models.product.query().findById(request.params.id);

      try {
        await product.$query().patch(request.body);
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
