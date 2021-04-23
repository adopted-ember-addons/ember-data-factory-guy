import Transform from '@ember-data/serializer/transform';
import { isEmpty, typeOf } from '@ember/utils';

export default Transform.extend({
  serialize: function (value) {
    return value ? JSON.stringify(value) : '{}';
  },
  deserialize: function (value) {
    if (isEmpty(value)) {
      return {};
    }
    if (typeOf(value) === 'object') {
      return value;
    }
    if (typeOf(value) === 'string') {
      return JSON.parse(value);
    }
  },
});
