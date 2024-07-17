import FactoryGuy from '@eflexsystems/ember-data-factory-guy';

FactoryGuy.define('mailing-address', {
  default: {
    mailingAddressProperty: FactoryGuy.generate((num) => num),
  },
});
