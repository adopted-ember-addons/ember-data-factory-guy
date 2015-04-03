import FactoryGuy from 'ember-data-factory-guy/factory-guy';

FactoryGuy.define('user', {
  sequences: {
    name: function(num) {return 'User' + num;}
  },
  // default values for 'user' attributes
  default: {
    name: FactoryGuy.generate('name')
  },
  // named 'user' type with custom attributes
  admin: {
    name: 'Admin'
  },
  user_with_projects: {
    projects: FactoryGuy.hasMany('project', 2)
  },
  traits: {
    with_company: {
      company: {}
    },
    with_projects: {
      projects: FactoryGuy.hasMany('project', 2)
    },
    with_hats: {
      hats: FactoryGuy.hasMany('big-hat', 2)
    },
    with_hats_belonging_to_user: {
      hats: FactoryGuy.hasMany('big-hat', 2, 'belonging_to_user')
    },
    with_hats_belonging_to_outfit: {
      hats: FactoryGuy.hasMany('big-hat', 2, 'belonging_to_outfit')
    }
  }
});

