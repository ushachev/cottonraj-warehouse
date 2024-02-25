export const up = (knex) => (
  knex.schema.createTable('purchase_items', (table) => {
    table.increments('id').primary();
    table.integer('purchase_id').unsigned().references('id').inTable('purchases');
    table.integer('number');
    table.integer('product_id').unsigned().references('id').inTable('products');
    table.integer('count');
    table.integer('price');
    table.timestamps(true, true);
  })
);

export const down = (knex) => knex.schema.dropTable('purchase_items');
