import FactoryGuy from 'ember-data-factory-guy';

FactoryGuy.define('villain', {
  default: {
    type: 'Villain',
    name: (f) => `BadGuy#${f.id}`,
  },
  joker: {
    name: 'Joker',
  },
});
