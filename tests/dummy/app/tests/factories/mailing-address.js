import FactoryGuy from '@eflexsystems/ember-data-factory-guy';

export default FactoryGuy.define('mailing-address', {
  default: {
    mailingAddressProperty: FactoryGuy.generate((num) => num),
  },
});
