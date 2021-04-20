import FactoryGuy from 'ember-data-factory-guy';

FactoryGuy.define('salary', {
  default: {
    income: 90000,
    benefits: ['health', 'company car', 'dental'],
  },
});
