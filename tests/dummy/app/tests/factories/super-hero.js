import FactoryGuy from 'ember-data-factory-guy';
import './hat';

FactoryGuy.define('super-hero', {
  default: {
    name: 'BatMan',
    type: 'SuperHero'
  }
});