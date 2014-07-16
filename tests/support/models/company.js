Company = DS.Model.extend({
  name:    DS.attr('string'),
  profile: DS.belongsTo('profile'),
  users:   DS.hasMany('user', {async: true, inverse: 'company'})
});
