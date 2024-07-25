import FactoryGuy from '@eflexsystems/ember-data-factory-guy';

export default FactoryGuy.define('outfit', {
  sequences: {
    name: (num) => `Outfit-${num}`,
  },
  default: {
    name: FactoryGuy.generate('name'),
  },
});
