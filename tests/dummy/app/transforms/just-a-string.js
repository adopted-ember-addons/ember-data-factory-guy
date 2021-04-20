import Transform from '@ember-data/serializer/transform';

export default Transform.extend({
  serialize: function (/*value*/) {
    return 'failed';
  },
  deserialize: function (/*value*/) {
    return 'failed';
  },
});
