import FactoryGuy from 'ember-data-factory-guy';

FactoryGuy.define('department-employment', {
  default: {
    startDate: new Date('2015-01-01'),
    endDate: new Date('2016-01-01'),
    department: FactoryGuy.belongsTo('department'),
  },
});
