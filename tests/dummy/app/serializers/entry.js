import DS from 'ember-data';
import Ember from 'ember';

export default DS.JSONAPISerializer.extend({
  // don't pluralize the payload key.
  payloadKeyFromModelName(modelName) {
    return modelName;
  }
});
