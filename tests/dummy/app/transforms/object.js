import { isEmpty, typeOf } from '@ember/utils';
import DS from 'ember-data';

export default DS.Transform.extend({
  serialize: function(value) {
    return value ? JSON.stringify(value) : '{}';
  },
  deserialize: function(value) {
    if (isEmpty(value)) {
      return {};
    }
    if (typeOf(value) === "object") {
      return value;
    }
    if (typeOf(value) === 'string') {
      return JSON.parse(value);
    }
  }
});
