import DS from 'ember-data';

export default DS.Model.extend({
  name: DS.attr('string'),
  person: DS.belongsTo('person', {async: false, polymorphic: true}), 
  hats: DS.hasMany('hat', {async: false, polymorphic: true})
});
