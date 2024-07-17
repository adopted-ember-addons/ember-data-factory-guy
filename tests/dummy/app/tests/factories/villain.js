import FactoryGuy from 'ember-data-factory-guy';

FactoryGuy.define('villain', {
  default: {
    type: 'villain',
    name: (f) => `BadGuy#${f.id}`,
  },
  joker: {
    name: 'Joker',
  },
});
