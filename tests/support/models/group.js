Group = DS.Model.extend({
  type:    DS.attr('string', {defaultValue: 'Group'}),
  versions: DS.hasMany('group'),
  profiles: DS.hasMany('profile')
})

BigGroup = Group.extend({
  type:    DS.attr('string', {defaultValue: 'BigGroup'}),
  group: DS.belongsTo('group')
})

SmallGroup = Group.extend({
  type:    DS.attr('string', {defaultValue: 'SmallGroup'}),
  group: DS.belongsTo('group')
})

