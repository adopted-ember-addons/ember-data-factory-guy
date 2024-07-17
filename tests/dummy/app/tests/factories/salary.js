import FactoryGuy from '@eflexsystems/ember-data-factory-guy';

FactoryGuy.define('salary', {
  default: {
    income: 90000,
    benefits: ['health', 'company car', 'dental'],
  },
});
