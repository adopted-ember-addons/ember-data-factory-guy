import FactoryGuy from 'ember-data-factory-guy';

FactoryGuy.define('manager', {
  default: {
    name: FactoryGuy.belongsTo('name')
  },
  traits: {
    default_name_setup: {
      name: {}
    },
    with_salary: {
      salary: FactoryGuy.belongsTo('salary')
    },
    with_reviews: {
      reviews: FactoryGuy.hasMany('review', 2)
    }
  }
});
