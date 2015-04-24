import FactoryGuy from 'ember-data-factory-guy';

FactoryGuy.define("small-company", {
  default: {
    name: 'Small Corp',
    projects: FactoryGuy.hasMany('project', 2)
  }
});
