import FactoryGuy from 'ember-data-factory-guy';

FactoryGuy.define('company', {
  default: {
    type: 'Company',
    name: 'Silly corp',
  },

  marvel: {
    name: 'Marvel Comics',
  },

  traits: {
    with_profile: {
      profile: {},
    },
    with_projects: {
      projects: FactoryGuy.hasMany('project', 2),
    },
  },
});
