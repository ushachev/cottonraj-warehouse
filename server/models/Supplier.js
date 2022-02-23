/* eslint-disable import/no-cycle */

import objection from 'objection';
import objectionUnique from 'objection-unique';
import Purchase from './Purchase.js';

const { Model } = objection;
const unique = objectionUnique({ fields: ['name'] });

export default class Supplier extends unique(Model) {
  static get tableName() {
    return 'suppliers';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['name'],
      properties: {
        id: { type: 'integer' },
        name: { type: 'string', minLength: 3 },
        shortName: { type: 'string', minLength: 3 },
      },
    };
  }

  static get relationMappings() {
    return {
      purchases: {
        relation: Model.HasManyRelation,
        modelClass: Purchase,
        join: {
          from: 'suppliers.id',
          to: 'purchases.supplierId',
        },
      },
    };
  }
}
