Person = DS.Model.extend({
  type: DS.attr('string'),
  name: DS.attr('string'),
  company: DS.belongsTo('company', {embedded: 'always'}),
  outfits: DS.hasMany('outfit', {embedded: 'always'})
})
