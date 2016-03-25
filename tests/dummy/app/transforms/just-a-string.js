import DS from 'ember-data';
import Ember from 'ember';

export default DS.Transform.extend({
  serialize: function(value) {
    return 'failed';
  },
  deserialize: function(value) {
    return 'failed';
  }
});
