Employee = DS.Model.extend({
  department: DS.belongsTo('department', {async: true}),
  profile: DS.belongsTo('profile')
})

