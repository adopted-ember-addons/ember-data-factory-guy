import DS from 'ember-data';

export default DS.Model.extend({
  type:    DS.attr('string', {defaultValue: 'Group'}),
  name:    DS.attr('string'),
  profiles: DS.hasMany('profile'),
  group: DS.belongsTo('group', {inverse: 'versions'}),
  versions: DS.hasMany('group', {inverse: 'group'})
});
