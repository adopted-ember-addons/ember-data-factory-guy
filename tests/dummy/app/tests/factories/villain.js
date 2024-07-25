import FactoryGuy from '@eflexsystems/ember-data-factory-guy';

export default FactoryGuy.define('villain', {
  default: {
    type: 'villain',
    name: (f) => `BadGuy#${f.id}`,
  },
  joker: {
    name: 'Joker',
  },
});
