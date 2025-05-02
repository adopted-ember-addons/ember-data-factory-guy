import Transform from '@ember-data/serializer/transform';
import { isEmpty, typeOf } from '@ember/utils';

export default class extends Transform {
  serialize(value) {
    return value ? JSON.stringify(value) : '{}';
  }
  deserialize(value) {
    if (isEmpty(value)) {
      return {};
    }
    if (typeOf(value) === 'object') {
      return value;
    }
    if (typeOf(value) === 'string') {
      return JSON.parse(value);
    }
  }
}
