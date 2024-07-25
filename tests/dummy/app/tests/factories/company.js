import FactoryGuy from '@eflexsystems/ember-data-factory-guy';

export default FactoryGuy.define('company', {
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
