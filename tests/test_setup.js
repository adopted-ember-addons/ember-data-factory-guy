FactoryGuy.define('project', {
  default: {title: 'Project'}
});
FactoryGuy.define('user', {
 // default values for 'user' attributes
  default: {
    name: 'User1'
  },
  // named 'user' type with custom attributes
  admin: {
    name: 'Admin'
  }
});
Project = DS.Model.extend({
  title: DS.attr('string'),
  user: DS.belongsTo('user')
})

User = DS.Model.extend({
  name:     DS.attr('string'),
  projects: DS.hasMany('project')
})
