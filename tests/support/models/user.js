User = DS.Model.extend({
  name:     DS.attr('string'),
  projects: DS.hasMany('project')
})
