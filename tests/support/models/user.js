User = DS.Model.extend({
  name:     DS.attr('string'),
  company: DS.belongsTo('company', {async: true}),
  projects: DS.hasMany('project'),
  hats: DS.hasMany('hat', {polymorphic: true})
})