/* eslint-disable import/no-cycle */

import objection from 'objection';
import objectionUnique from 'objection-unique';
import Barcode from './Barcode.js';
import PurchaseItem from './PurchaseItem.js';

const { Model } = objection;
const unique = objectionUnique({ fields: ['name'] });

export default class Product extends unique(Model) {
  static get tableName() {
    return 'products';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['name'],
      properties: {
        id: { type: 'integer' },
        name: { type: 'string', minLength: 5 },
        shortName: { type: 'string', minLength: 5 },
        price: { type: 'integer', minimum: 1 },
      },
    };
  }

  static get relationMappings() {
    return {
      barcodes: {
        relation: Model.HasManyRelation,
        modelClass: Barcode,
        join: {
          from: 'products.id',
          to: 'barcodes.productId',
        },
      },
      purchaseItems: {
        relation: Model.HasManyRelation,
        modelClass: PurchaseItem,
        join: {
          from: 'products.id',
          to: 'purchase_items.productId',
        },
      },
    };
  }
}
