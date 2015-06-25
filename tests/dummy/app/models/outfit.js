import DS from 'ember-data';

export default DS.Model.extend({
  name: DS.attr('string'),
  hats: DS.hasMany('hat', {async: false, polymorphic: true})
});
