export const up = (knex) => knex.schema
  .createTable('users', (table) => {
    table.increments('id').primary();
    table.string('username');
    table.string('first_name');
    table.string('last_name');
    table.string('email');
    table.string('password_digest');
    table.timestamps(true, true);
  })
  .createTable('suppliers', (table) => {
    table.increments('id').primary();
    table.string('name');
    table.string('short_name');
    table.timestamps(true, true);
  })
  .createTable('categories', (table) => {
    table.increments('id').primary();
    table.string('name');
    table.integer('parent_id').unsigned().references('id').inTable('categories');
    table.timestamps(true, true);
  })
  .createTable('products', (table) => {
    table.increments('id').primary();
    table.string('name');
    table.string('short_name');
    table.integer('price');
    table.integer('category_id').unsigned().references('id').inTable('categories');
    table.timestamps(true, true);
  })
  .createTable('barcodes', (table) => {
    table.increments('id').primary();
    table.string('value');
    table.integer('product_id').unsigned().references('id').inTable('products');
    table.timestamps(true, true);
  })
  .createTable('purchases', (table) => {
    table.increments('id').primary();
    table.string('number');
    table.date('date');
    table.integer('supplier_id').unsigned().references('id').inTable('suppliers');
    table.timestamps(true, true);
  })
  .createTable('purchase_items', (table) => {
    table.increments('id').primary();
    table.integer('purchase_id').unsigned().references('id').inTable('purchases');
    table.integer('number');
    table.integer('product_id').unsigned().references('id').inTable('products');
    table.integer('count');
    table.integer('price');
    table.timestamps(true, true);
  });

export const down = (knex) => knex.schema
  .dropTable('purchase_items')
  .dropTable('purchases')
  .dropTable('barcodes')
  .dropTable('products')
  .dropTable('categories')
  .dropTable('suppliers')
  .dropTable('users');
