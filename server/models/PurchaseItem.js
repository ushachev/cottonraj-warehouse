/* eslint-disable import/no-cycle */

import objection from 'objection';
import Purchase from './Purchase.js';
import Product from './Product.js';

const { Model } = objection;

export default class PurchaseItem extends Model {
  static get tableName() {
    return 'purchase_items';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['number', 'productId', 'count', 'price'],
      properties: {
        id: { type: 'integer' },
        purchaseId: { type: 'integer', minimum: 1 },
        number: { type: 'integer', minimum: 1 },
        productId: { type: 'integer', minimum: 1 },
        count: { type: 'integer', minimum: 1 },
        price: { type: 'integer', minimum: 1 },
      },
    };
  }

  static get relationMappings() {
    return {
      purchase: {
        relation: Model.BelongsToOneRelation,
        modelClass: Purchase,
        join: {
          from: 'purchase_items.purchaseId',
          to: 'purchase.id',
        },
      },
      product: {
        relation: Model.BelongsToOneRelation,
        modelClass: Product,
        join: {
          from: 'purchase_items.productId',
          to: 'products.id',
        },
      },
    };
  }
}
