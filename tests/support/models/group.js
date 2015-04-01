Group = DS.Model.extend({
  type:    DS.attr('string', {defaultValue: 'Group'}),
  name:    DS.attr('string'),
  profiles: DS.hasMany('profile'),
  versions: DS.hasMany('group', {polymorphic: true, inverse: 'group'}),
  group: DS.belongsTo('group', {inverse: 'versions'})
})

BigGroup = Group.extend({
  type:    DS.attr('string', {defaultValue: 'BigGroup'})
})

SmallGroup = Group.extend({
  type:    DS.attr('string', {defaultValue: 'SmallGroup'})
})

