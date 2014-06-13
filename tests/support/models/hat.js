Hat = DS.Model.extend({
  type: DS.attr('string'),
  user: DS.belongsTo('user'),
  hat:  DS.belongsTo('hat', {inverse: 'hats', polymorphic: true}),
  hats: DS.hasMany('hat', {inverse: 'hat', polymorphic: true})
});

BigHat = Hat.extend({
  materials: DS.hasMany('soft_material')
});
SmallHat = Hat.extend();


