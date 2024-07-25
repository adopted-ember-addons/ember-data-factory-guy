import FactoryGuy from '@eflexsystems/ember-data-factory-guy';

export default FactoryGuy.define('salary', {
  default: {
    income: 90000,
    benefits: ['health', 'company car', 'dental'],
  },
});
