import DS from 'ember-data';

export default DS.Model.extend({
  type: DS.attr('string'),
  name: DS.attr('string'),
  category: DS.attr('string'),
  company: DS.belongsTo('company', {async: false, embedded: 'always'}),
  outfits: DS.hasMany('outfit', {async: false, embedded: 'always'})
});
