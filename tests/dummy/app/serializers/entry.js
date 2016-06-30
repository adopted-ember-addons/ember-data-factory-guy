import DS from 'ember-data';

export default DS.JSONAPISerializer.extend({
  // don't pluralize the payload key.
  payloadKeyFromModelName(modelName) {
    return modelName;
  }
});
