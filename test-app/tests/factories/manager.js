import FactoryGuy from 'ember-data-factory-guy';

FactoryGuy.define('manager', {
  default: {
    name: FactoryGuy.belongsTo('name'),
  },
  traits: {
    default_name_setup: {
      name: {},
    },
    withSalary: {
      salary: FactoryGuy.belongsTo('salary'),
    },
    withReviews: {
      reviews: FactoryGuy.hasMany('review', 2),
    },
  },
});
