import FactoryGuy from '@eflexsystems/ember-data-factory-guy';

export default FactoryGuy.define('department', {
  default: {
    name: FactoryGuy.generate((num) => `Acme Dept ${num}`),
  },
});
