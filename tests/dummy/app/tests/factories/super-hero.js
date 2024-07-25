import FactoryGuy from '@eflexsystems/ember-data-factory-guy';

export default FactoryGuy.define('super-hero', {
  default: {
    name: 'GoodGuy',
    type: 'SuperHero',
  },
  bat_man: {
    name: 'BatMan',
    type: 'SuperHero',
  },
});
