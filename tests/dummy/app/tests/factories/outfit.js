import FactoryGuy from 'ember-data-factory-guy';

FactoryGuy.define('outfit', {
  sequences: {
    name: (num) => `Outfit-${num}`,
  },
  default: {
    name: FactoryGuy.generate('name'),
  },
});
