import DS from 'ember-data';

export default DS.Model.extend({
  type: DS.attr('string'),
  name: DS.attr('string'),
  category: DS.attr('string'),
  company: DS.belongsTo('company', {embedded: 'always'}),
  outfits: DS.hasMany('outfit', {embedded: 'always'})
});
