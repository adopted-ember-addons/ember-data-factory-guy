import FactoryGuy from '@eflexsystems/ember-data-factory-guy';
import './hat';

FactoryGuy.define('small-hat', {
  extends: 'hat',
  default: {
    type: 'small-hat',
  },
});
