import DS from 'ember-data';
import Ember from 'ember';

export default DS.JSONAPISerializer.extend({
  attrs: {
    entries: { serialize: true }
  },

  // don't pluralize the payload key.
  payloadKeyFromModelName(modelName) {
    return modelName;
  }
});
