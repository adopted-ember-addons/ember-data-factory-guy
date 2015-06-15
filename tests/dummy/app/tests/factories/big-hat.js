import FactoryGuy from 'ember-data-factory-guy';
import './hat';

FactoryGuy.define('big-hat', {
  extends: 'hat',
  'big-hat': {
    type: 'BigHat'
  }
});