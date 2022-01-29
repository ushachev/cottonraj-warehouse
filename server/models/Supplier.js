import objectionUnique from 'objection-unique';
import BaseModel from './BaseModel.js';

const unique = objectionUnique({ fields: ['name'] });

export default class Supplier extends unique(BaseModel) {
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
}
