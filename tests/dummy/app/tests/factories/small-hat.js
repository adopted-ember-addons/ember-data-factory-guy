import FactoryGuy from '@eflexsystems/ember-data-factory-guy';
import Hat from './hat';

export default FactoryGuy.define('small-hat', {
  extends: Hat,
  default: {
    type: 'small-hat',
  },
});
