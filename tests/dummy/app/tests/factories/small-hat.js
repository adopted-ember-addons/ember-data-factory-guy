import FactoryGuy from '@eflexsystems/ember-data-factory-guy';
import './hat';

export default FactoryGuy.define('small-hat', {
  extends: 'hat',
  default: {
    type: 'small-hat',
  },
});
