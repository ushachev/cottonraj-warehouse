export const up = (knex) => (
  knex.schema.createTable('categories', (table) => {
    table.increments('id').primary();
    table.string('name');
    table.integer('parent_id').unsigned().references('id').inTable('categories');
    table.timestamps(true, true);
  })
);

export const down = (knex) => knex.schema.dropTable('categories');
