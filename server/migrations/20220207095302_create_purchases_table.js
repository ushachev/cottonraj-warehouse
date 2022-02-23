export const up = (knex) => (
  knex.schema.createTable('purchases', (table) => {
    table.increments('id').primary();
    table.string('number');
    table.date('date');
    table.integer('supplier_id').unsigned().references('id').inTable('suppliers');
    table.timestamps(true, true);
  })
);

export const down = (knex) => knex.schema.dropTable('purchases');
