import FactoryGuy from 'ember-data-factory-guy';

FactoryGuy.define('super-hero', {
  default: {
    name: 'GoodGuy',
    type: 'SuperHero',
  },
  bat_man: {
    name: 'BatMan',
    type: 'SuperHero',
  },
});
