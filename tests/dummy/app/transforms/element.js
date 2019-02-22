import DS from 'ember-data';

const REVERSE_SYMBOL_TABLE = {
  'carbon': 'C'
};

const SYMBOL_TABLE = {
  'C': 'carbon'
};

export default DS.Transform.extend({
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
  }
});
