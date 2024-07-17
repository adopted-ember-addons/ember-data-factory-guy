import FactoryGuy from '@eflexsystems/ember-data-factory-guy';

FactoryGuy.define('outfit', {
  sequences: {
    name: (num) => `Outfit-${num}`,
  },
  default: {
    name: FactoryGuy.generate('name'),
  },
});
