import DS from 'ember-data';

export default DS.Model.extend({
  type: DS.attr('string'),
  user: DS.belongsTo('user',{async: false, inverse: 'hats'}),
  outfit: DS.belongsTo('outfit', {async: false, inverse: 'hats'}),
  hat:  DS.belongsTo('hat', {inverse: 'hats', polymorphic: true}),
  hats: DS.hasMany('hat', {async: false, inverse: 'hat', polymorphic: true}),
  fluffyMaterials: DS.hasMany('fluffy-material', {async: false, inverse: 'hat'})
});
