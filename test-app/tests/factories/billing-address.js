import FactoryGuy from 'ember-data-factory-guy';
import './address';

FactoryGuy.define('billing-address', {
  extends: 'nested-fragment/address',
  default: {
    billingAddressProperty: FactoryGuy.generate((num) => num),
  },
});
