import DS from 'ember-data';

export default DS.Transform.extend({
  serialize: function(value) {
    return 'failed';
  },
  deserialize: function(value) {
    return 'failed';
  }
});
