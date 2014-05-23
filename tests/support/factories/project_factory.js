FactoryGuy.define('project', {
  default: {
    title: 'Project'
  },
  project_with_user: {
    // user model with default attributes
    user: {}
  },
  project_with_dude: {
    // user model with custom attributes
    user: {name: 'Dude'}
  },
  project_with_admin: {
    // for named association, use this FactoryGuy.association helper method
    user: FactoryGuy.association('admin')
  }
});