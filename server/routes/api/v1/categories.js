export default async (app) => {
  const { models } = app.objection;

  app
    .get('/categories', { name: 'categories' }, async () => {
      const categories = await models.category.query()
        .modify('defaultSelects')
        .withGraphFetched('children(idSelects)');

      return {
        categories: categories.map(({ children, ...categoryData }) => ({
          ...categoryData,
          children: children.map(({ id }) => id),
        })),
      };
    });
};
