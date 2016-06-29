import DS from 'ember-data';

export default DS.Model.extend({
  type: DS.attr('string'),
  name: DS.attr('string'),
  style: DS.attr('string'),
  category: DS.attr('string'),
  company: DS.belongsTo('company', {async: false}),
  outfits: DS.hasMany('outfit', {async: false})
});
