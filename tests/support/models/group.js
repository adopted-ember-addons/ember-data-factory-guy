Group = DS.Model.extend({
  type:    DS.attr('string', {defaultValue: 'Group'}),
  name:    DS.attr('string'),
  versions: DS.hasMany('group', {inverse: null}),
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

