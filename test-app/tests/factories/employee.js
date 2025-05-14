import FactoryGuy from 'ember-data-factory-guy';

FactoryGuy.define('employee', {
  default: {
    gender: 'Male',
    birthDate: new Date('2016-05-01'),
  },
});
