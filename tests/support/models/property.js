Property = DS.Model.extend({
  name:    DS.attr('string'),
  company: DS.belongsTo('company', {async: true}),
  owners:  DS.hasMany('user', {async: true, inverse: 'properties'})
});