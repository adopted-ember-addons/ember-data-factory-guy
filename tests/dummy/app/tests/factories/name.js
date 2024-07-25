import FactoryGuy from '@eflexsystems/ember-data-factory-guy';

export default FactoryGuy.define('name', {
  default: {
    firstName: 'Tyrion',
    lastName: 'Lannister',
  },
  employee_geoffrey: {
    firstName: 'Geoffrey',
    lastName: 'Lannister',
  },
  traits: {
    kingslayer: {
      firstName: 'Jamie',
    },
  },
});
