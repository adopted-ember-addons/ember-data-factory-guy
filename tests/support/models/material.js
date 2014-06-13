SoftMaterial = DS.Model.extend({
  name: DS.attr('string'),
  hat:  DS.belongsTo('big_hat')
})
