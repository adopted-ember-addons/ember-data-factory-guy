import FactoryGuy from '@eflexsystems/ember-data-factory-guy';
import './hat';

export default FactoryGuy.define('big-hat', {
  extends: 'hat',
  default: {
    type: 'big-hat',
  },
});
