import DS from 'ember-data';
import Ember from 'ember';

export default DS.Transform.extend({
  serialize: function(deserialized) {
    return deserialized ? JSON.stringify(deserialized) : '{}';
  },
  deserialize: function(serialized) {
    if (Ember.isEmpty(serialized)) {
      return {};
    }
    if (Ember.typeOf(serialized) === "object") {
      return serialized;
    }
    if (Ember.typeOf(serialized) === 'string') {
      return JSON.parse(serialized);
    }
  }
});
