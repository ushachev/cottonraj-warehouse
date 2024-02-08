export const up = (knex) => knex.schema
  .table('barcodes', (table) => {
    table.dropForeign('product_id');
  })
  .table('purchase_items', (table) => {
    table.dropForeign('product_id');
  })
  .table('products', (table) => {
    table.integer('category_id').unsigned().nullable();
    table.foreign('category_id').references('id').inTable('categories');
  })
  .table('barcodes', (table) => {
    table.foreign('product_id').references('id').inTable('products');
  })
  .table('purchase_items', (table) => {
    table.foreign('product_id').references('id').inTable('products');
  });

export const down = (knex) => knex.schema
  .table('barcodes', (table) => {
    table.dropForeign('product_id');
  })
  .table('purchase_items', (table) => {
    table.dropForeign('product_id');
  })
  .table('products', (table) => {
    table.dropForeign('category_id');
    table.dropColumn('category_id');
  })
  .table('barcodes', (table) => {
    table.foreign('product_id').references('id').inTable('products');
  })
  .table('purchase_items', (table) => {
    table.foreign('product_id').references('id').inTable('products');
  });
