import Ember from 'ember';
import DS from 'ember-data';

export default DS.RESTSerializer.extend({
  keyForAttribute(attr) {
    return Ember.String.decamelize(attr);
  },
});
