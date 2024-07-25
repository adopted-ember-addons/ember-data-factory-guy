import FactoryGuy from '@eflexsystems/ember-data-factory-guy';
import './group';

export default FactoryGuy.define('small-group', {
  extends: 'group',
  sequences: {
    name: function (num) {
      return 'Small Group' + num;
    },
  },
  default: {
    type: 'small-group',
  },
});
