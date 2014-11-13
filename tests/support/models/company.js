Company = DS.Model.extend({
  type:    DS.attr('string', {defaultValue: 'Company'}),
  name:    DS.attr('string'),
  profile: DS.belongsTo('profile'),
  users:   DS.hasMany('user', {async: true, inverse: 'company'}),
  projects: DS.hasMany('project', {async: true})
});

SmallCompany = Company.extend({
  type:    DS.attr('string', {defaultValue: 'SmallCompany'}),
  owner: DS.belongsTo('user', {async: true}),
  projects: DS.hasMany('project')
});
