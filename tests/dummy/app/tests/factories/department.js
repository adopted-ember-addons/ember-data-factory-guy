import FactoryGuy from 'ember-data-factory-guy';

FactoryGuy.define('department', {
  default: {
    name: FactoryGuy.generate((num) => `Acme Dept ${num}`),
    addresses: FactoryGuy.hasMany('nested-fragment/address', 3),
  },
});
