import FactoryGuy from 'ember-data-factory-guy';

FactoryGuy.define('billing-address', {
  default: {
    billingAddressProperty: FactoryGuy.generate((num) => num),
  }
});
