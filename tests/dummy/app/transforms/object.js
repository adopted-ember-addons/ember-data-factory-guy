import DS from 'ember-data';

export default DS.Transform.extend({
  serialize: function(obj) {
    return obj ? JSON.parse(obj) : {};
  },
  deserialize: function(obj) {
    return obj ? JSON.stringify(obj) : '{}';
  }
});
