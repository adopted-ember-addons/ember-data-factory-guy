import DS from 'ember-data';
import Ember from 'ember';

export default DS.Transform.extend({
  serialize: function(value) {
    return value ? JSON.stringify(value) : '{}';
  },
  deserialize: function(value) {
    if (Ember.isEmpty(value)) {
      return {};
    }
    if (Ember.typeOf(value) === "object") {
      return value;
    }
    if (Ember.typeOf(value) === 'string') {
      return JSON.parse(value);
    }
  }
});
