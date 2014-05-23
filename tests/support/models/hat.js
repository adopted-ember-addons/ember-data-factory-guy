Hat = DS.Model.extend({
  type: DS.attr('string'),
  user: DS.belongsTo('user')
})

BigHat = Hat.extend()
SmallHat = Hat.extend()

