Group = DS.Model.extend({
  versions: DS.hasMany('group')
})

BigGroup = Group.extend({
  group: DS.belongsTo('group')
})

SmallGroup = Group.extend({
  group: DS.belongsTo('group')
})

