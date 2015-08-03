import FactoryGuy from 'ember-data-factory-guy';
import './hat';

FactoryGuy.define('super-hero', {
  default: {
    name: 'MooMan',
    type: 'BigHero'
  },
  bat_man: {
    name: 'BatMan',
    type: 'SuperHero'
  }
});