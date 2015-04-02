import DS from 'ember-data';

export default DS.Model.extend({
  type:    DS.attr('string', {defaultValue: 'Group'}),
  name:    DS.attr('string'),
  profiles: DS.hasMany('profile'),
  versions: DS.hasMany('group', {polymorphic: true, inverse: 'group'}),
  group: DS.belongsTo('group', {inverse: 'versions'})
});
