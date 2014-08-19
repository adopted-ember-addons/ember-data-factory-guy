FactoryGuy.define('user', {
  // default values for 'user' attributes
  default: {
    name: 'User1'
  },
  // named 'user' type with custom attributes
  admin: {
    name: 'Admin'
  },
  user_with_projects: {
    projects: FactoryGuy.hasMany('project', 2)
  },
  traits: {
    with_projects: {
      projects: FactoryGuy.hasMany('project', 2)
    }
  }
});