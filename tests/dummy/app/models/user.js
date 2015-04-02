import DS from 'ember-data';

export default DS.Model.extend({
  name:       DS.attr('string'),
  info:       DS.attr('object'),
  company:    DS.belongsTo('company', {async: true, inverse: 'users', polymorphic: true}),
  properties: DS.hasMany('property', {async: true, inverse: 'owners'}),
  projects:   DS.hasMany('project', {embedded: 'always'}),
  hats:       DS.hasMany('hat', {polymorphic: true})
});
