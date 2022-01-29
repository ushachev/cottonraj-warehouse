export const up = (knex) => (
  knex.schema.createTable('suppliers', (table) => {
    table.increments('id').primary();
    table.string('name');
    table.string('short_name');
    table.timestamps(true, true);
  })
);

export const down = (knex) => knex.schema.dropTable('suppliers');
