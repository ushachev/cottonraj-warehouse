const productCreationSchema = {
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

const batchProductsUpdatingSchema = {
  body: {
    type: 'object',
    properties: {
      categoryId: { type: 'integer' },
    },
    additionalProperties: false,
  },
  query: {
    type: 'object',
    properties: {
      ids: {
        type: 'array',
        uniqueItems: true,
        items: { type: 'integer' },
      },
    },
    required: ['ids'],
  },
};

export default async (app) => {
  const { models } = app.objection;

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
    .post('/products', { schema: productCreationSchema }, async (request, reply) => {
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
    .patch('/products', { schema: batchProductsUpdatingSchema }, async (request, reply) => {
      const { query: { ids }, body } = request;
      try {
        const products = await models.product.query().findByIds(ids);

        await models.product.transaction(async (trx) => {
          await Promise.all(products.map((product) => product.$query(trx).patch(body)));
        });
        reply.code(204);

        return null;
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
