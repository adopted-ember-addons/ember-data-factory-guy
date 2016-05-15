import FactoryGuy from 'ember-data-factory-guy';

FactoryGuy.define('train', {
  default: {
    name: (f)=>`Train-${f.id}`
  },

  traits: {
    'with_city': {
      city: FactoryGuy.belongsTo('city')
    },
    'with_cars': {
      cars: FactoryGuy.hasMany('car', 2)
    }
  }
});
