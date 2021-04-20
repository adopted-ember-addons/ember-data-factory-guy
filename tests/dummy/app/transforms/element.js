import Transform from '@ember-data/serializer/transform';

const REVERSE_SYMBOL_TABLE = {
  carbon: 'C',
};

const SYMBOL_TABLE = {
  C: 'carbon',
};

export default Transform.extend({
  serialize(deserialized, opts) {
    if (opts.as_symbol) {
      return REVERSE_SYMBOL_TABLE[deserialized];
    }
    return deserialized;
  },

  deserialize(serialized, opts) {
    if (opts.as_symbol) {
      return SYMBOL_TABLE[serialized];
    }
    return serialized;
  },
});
