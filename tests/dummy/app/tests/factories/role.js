import FactoryGuy from 'ember-data-factory-guy';

FactoryGuy.define('role', {
  default: {
    seniorityLevel: 'Senior',
    specializationDomain: 'VP of Engineering'
  },
  traits: {
    junior_developer: {
      seniorityLevel: 'Junior',
      specializationDomain: 'Ember Develope'
    },
  }
});
