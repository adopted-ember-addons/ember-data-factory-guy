import DS from 'ember-data';

export default DS.Model.extend({
  type:    DS.attr('string', {defaultValue: 'Group'}),
  name:    DS.attr('string'),
  versions: DS.hasMany('group', {inverse: null}),
  profiles: DS.hasMany('profile')
});
