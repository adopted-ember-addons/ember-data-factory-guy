import Ember from 'ember';
import DS from 'ember-data';

export default DS.RESTSerializer.extend({
  keyForAttribute(attr) {
    console.log('name here',Ember.String.decamelize(attr));
    return Ember.String.decamelize(attr);
//    return this._super(...arguments);
  }
});