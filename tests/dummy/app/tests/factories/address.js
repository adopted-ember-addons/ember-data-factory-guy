import FactoryGuy from 'ember-data-factory-guy';

FactoryGuy.define('nested-fragment/address', {
  sequences: {
    house: (num) => `${num} Sky Cell`,
  },
  default: {
    street: FactoryGuy.generate('house'),
    city: 'Eyre',
    region: 'Vale of Arryn',
    country: 'Westeros',
  },
});
