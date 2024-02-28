import { dirname } from 'path';
import { fileURLToPath } from 'url';
import objection from 'objection';

const { Model } = objection;
const __dirname = dirname(fileURLToPath(import.meta.url));

export default class BaseModel extends Model {
  static get modelPaths() {
    return [__dirname];
  }
}
