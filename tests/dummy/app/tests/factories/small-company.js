import FactoryGuy from '@eflexsystems/ember-data-factory-guy';

FactoryGuy.define('small-company', {
  default: {
    type: 'SmallCompany',
    name: 'Small Corp',
    projects: FactoryGuy.hasMany('project', 2),
  },
});
