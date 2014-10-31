Hat = DS.Model.extend({
  type: DS.attr('string'),
  user: DS.belongsTo('user'),
  outfit: DS.belongsTo('outfit'),
  hat:  DS.belongsTo('hat', {inverse: 'hats', polymorphic: true}),
  hats: DS.hasMany('hat', {inverse: 'hat', polymorphic: true}),
  fluffy_materials: DS.hasMany('fluffy_materials')
});

BigHat = Hat.extend({
  materials: DS.hasMany('soft_material')
});
SmallHat = Hat.extend();


