export default async (app) => {
  const { models } = app.objection;
  const schema = {
    body: {
      type: 'object',
      properties: {
        number: { type: 'string' },
        date: { type: 'string', format: 'date' },
        supplierId: { type: 'integer' },
        items: {
          type: 'array',
          items: { $ref: '#/$defs/item' },
          minItems: 1,
        },
      },
      required: ['number', 'date', 'supplierId', 'items'],
      $defs: {
        product: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            barcodes: {
              type: 'array',
              uniqueItems: true,
              items: { type: 'string' },
            },
            categoryId: { type: ['integer', 'null'] },
          },
          required: ['name'],
        },
        item: {
          type: 'object',
          properties: {
            number: 'integer',
            productId: ['integer', 'null'],
            product: { $ref: '#/$defs/product' },
            count: 'integer',
            price: 'integer',
          },
          required: ['number', 'productId', 'product', 'count', 'price'],
        },
      },
    },
  };

  app
    .get('/', { name: 'purchases' }, async () => {
      const purchases = await models.purchase.query()
        .withGraphJoined('[supplier(nameSelects), items(defaultSelects).[product(nameSelects)]]');
      return { purchases };
    })
    .post('/', { schema }, async (request, reply) => {
      const { items, ...purchaseData } = request.body;

      try {
        const purchase = await models.purchase.transaction(async (trx) => {
          const normalizedItems = items.map(({ productId, product, ...purchaseItemData }) => ({
            ...purchaseItemData,
            product: productId
              ? { '#dbRef': productId }
              : {
                name: product.name,
                barcodes: product.barcodes?.map((bc) => ({ value: bc })),
                category: { '#dbRef': product.categoryId || null },
              },
          }));

          const purchaseEntity = await models.purchase.query(trx).insertGraph({
            ...purchaseData,
            items: normalizedItems,
          });

          return purchaseEntity;
        });

        reply.code(201);

        return purchase;
      } catch (error) {
        if (error.type !== 'ModelValidation') {
          return error;
        }

        reply.code(422);

        return { errors: error.data };
      }
    });
};
