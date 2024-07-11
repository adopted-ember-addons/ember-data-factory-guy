import FactoryGuy from 'ember-data-factory-guy';

FactoryGuy.define('department', {
  default: {
    name: FactoryGuy.generate((num) => `Acme Dept ${num}`),
  },
});
