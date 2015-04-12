import FactoryGuy from 'ember-data-factory-guy';

FactoryGuy.define("company", {
  default: {
    name: 'Silly corp'
  },
  traits: {
    with_profile: {
      profile: {}
    },
    with_projects: {
      projects: FactoryGuy.hasMany('project', 2)
    }
  }
});
