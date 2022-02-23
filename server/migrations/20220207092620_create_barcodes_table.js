export const up = (knex) => (
  knex.schema.createTable('barcodes', (table) => {
    table.increments('id').primary();
    table.string('value');
    table.integer('product_id').unsigned().references('id').inTable('products');
    table.timestamps(true, true);
  })
);

export const down = (knex) => knex.schema.dropTable('barcodes');
