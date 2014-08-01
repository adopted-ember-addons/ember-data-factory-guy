Company = DS.Model.extend({
  name:    DS.attr('string'),
  profile: DS.belongsTo('profile'),
  users:   DS.hasMany('user', {async: true, inverse: 'company'})
});

SmallCompany = Company.extend({
  owner: DS.belongsTo('user', {async: true}),
  projects: DS.hasMany('project', {async: true})
});
