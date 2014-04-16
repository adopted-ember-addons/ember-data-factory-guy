FixtureFactory.define('project', {
  default: {title: 'Project'}
});
FixtureFactory.define('user', {

  default: {
    name: 'User1'
  },

  admin: {
    name: 'Admin'
  }

});
Project = DS.Model.extend({
  title: DS.attr('string')
})

User = DS.Model.extend({
  name:     DS.attr('string'),
  projects: DS.hasMany('project')
})
