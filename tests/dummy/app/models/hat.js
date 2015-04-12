import DS from 'ember-data';

export default DS.Model.extend({
  type: DS.attr('string'),
  user: DS.belongsTo('user',{inverse: 'hats'}),
  outfit: DS.belongsTo('outfit'),
  hat:  DS.belongsTo('hat', {inverse: 'hats', polymorphic: true}),
  hats: DS.hasMany('hat', {inverse: 'hat', polymorphic: true}),
  fluffyMaterials: DS.hasMany('fluffy-material', {inverse: 'hat'})
});
