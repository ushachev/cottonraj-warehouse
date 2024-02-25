/* eslint-disable import/no-cycle */

import objection from 'objection';
import objectionUnique from 'objection-unique';
import Supplier from './Supplier.js';
import PurchaseItem from './PurchaseItem.js';

const { Model } = objection;
const unique = objectionUnique({ fields: [['number', 'date']] });

export default class Purchase extends unique(Model) {
  static get tableName() {
    return 'purchases';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['number', 'date', 'supplierId'],
      properties: {
        id: { type: 'integer' },
        number: { type: 'string', minLength: 1 },
        date: { type: 'string', minLength: 10 },
        supplierId: { type: 'integer', minimum: 1 },
      },
    };
  }

  static get modifiers() {
    return {
      defaultSelects(builder) {
        const { ref, raw } = Purchase;
        builder.select(
          ref('id'),
          ref('number'),
          raw("TO_CHAR(??::DATE, 'YYYY-MM-DD')", ref('date')).as('date'),
          ref('supplierId'),
        );
      },
    };
  }

  static get relationMappings() {
    return {
      supplier: {
        relation: Model.BelongsToOneRelation,
        modelClass: Supplier,
        join: {
          from: 'purchases.supplierId',
          to: 'suppliers.id',
        },
      },
      items: {
        relation: Model.HasManyRelation,
        modelClass: PurchaseItem,
        join: {
          from: 'purchases.id',
          to: 'purchaseItems.purchaseId',
        },
      },
    };
  }
}
