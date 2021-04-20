import FactoryGuy from 'ember-data-factory-guy';
import './hat';

FactoryGuy.define('small-hat', {
  extends: 'hat',
  default: {
    type: 'SmallHat',
  },
});
