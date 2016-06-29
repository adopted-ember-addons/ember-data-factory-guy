import Ember from 'ember';
import DS from 'ember-data';

export default DS.Model.extend({
  name:       DS.attr('string'),
  style:      DS.attr('string'),
  info:       DS.attr('object'),
  company:    DS.belongsTo('company', {async: true, inverse: 'users', polymorphic: true}),
  properties: DS.hasMany('property', {async: true, inverse: 'owners'}),
  projects:   DS.hasMany('project', {async: false}),
  hats:       DS.hasMany('hat', {async: false, polymorphic: true}),

  funnyName: Ember.computed("name", function() {
    return "funny " + this.get('name');
  })
});
