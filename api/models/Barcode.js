/* eslint-disable import/no-cycle */

import objection from 'objection';
import objectionUnique from 'objection-unique';
import Product from './Product.js';

const { Model } = objection;
const unique = objectionUnique({ fields: ['value'] });

export default class Barcode extends unique(Model) {
  static get tableName() {
    return 'barcodes';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['value'],
      properties: {
        id: { type: 'integer' },
        value: { type: 'string', minLength: 13, maxLength: 13 },
        productId: { type: 'integer', minimum: 1 },
      },
    };
  }

  static get modifiers() {
    return {
      defaultSelects(builder) {
        builder.select('value');
      },
    };
  }

  static get relationMappings() {
    return {
      product: {
        relation: Model.BelongsToOneRelation,
        modelClass: Product,
        join: {
          from: 'barcodes.productId',
          to: 'products.id',
        },
      },
    };
  }
}
