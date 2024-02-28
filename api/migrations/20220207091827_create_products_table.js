export const up = (knex) => (
  knex.schema.createTable('products', (table) => {
    table.increments('id').primary();
    table.string('name');
    table.string('short_name');
    table.integer('price');
    table.timestamps(true, true);
  })
);

export const down = (knex) => knex.schema.dropTable('products');
