import DS from 'ember-data';

export default DS.Model.extend({
  type:    DS.attr('string', {defaultValue: 'Company'}),
  name:    DS.attr('string'),
  profile: DS.belongsTo('profile', {async: false}),
  users:   DS.hasMany('user', {async: true, inverse: 'company'}),
  projects: DS.hasMany('project', {async: true})
});
