import FactoryGuy from 'ember-data-factory-guy';

FactoryGuy.define('name', {
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
