/* eslint-disable import/no-cycle */

import objection from 'objection';
import objectionUnique from 'objection-unique';
import Product from './Product.js';

const { Model } = objection;
const unique = objectionUnique({ fields: [['name', 'parentId']] });

export default class Category extends unique(Model) {
  static get tableName() {
    return 'categories';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['name'],
      properties: {
        id: { type: 'integer' },
        name: { type: 'string', minLength: 3 },
        parentId: { type: ['integer', 'null'], minimum: 1 },
      },
    };
  }

  static get modifiers() {
    return {
      defaultSelects(builder) {
        builder.select('id', 'name', 'parentId');
      },
      idSelects(builder) {
        builder.select('id');
      },
      orderByName: (builder) => {
        builder.orderBy('name');
      },
    };
  }

  static get relationMappings() {
    return {
      children: {
        relation: Model.HasManyRelation,
        modelClass: Category,
        join: {
          from: 'categories.id',
          to: 'categories.parentId',
        },
      },
      products: {
        relation: Model.HasManyRelation,
        modelClass: Product,
        join: {
          from: 'categories.id',
          to: 'products.categoryId',
        },
      },
    };
  }
}
