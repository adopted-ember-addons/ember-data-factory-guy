import DS from 'ember-data';

export default DS.Model.extend({
  type:    DS.attr('string', {defaultValue: 'Group'}),
  name:    DS.attr('string'),
  profiles: DS.hasMany('profile', {async: false}),
  versions: DS.hasMany('group', {async: false, polymorphic: true, inverse: 'group'}),
  group: DS.belongsTo('group', {async: false, inverse: 'versions'})
});
