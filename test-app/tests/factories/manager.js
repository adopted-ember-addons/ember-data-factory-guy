import FactoryGuy from 'ember-data-factory-guy';

FactoryGuy.define('manager', {
  default: {},
  traits: {
    withSalary: {
      salary: FactoryGuy.belongsTo('salary'),
    },
    withReviews: {
      reviews: FactoryGuy.hasMany('review', 2),
    },
  },
});
