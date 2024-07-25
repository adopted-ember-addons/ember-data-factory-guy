import FactoryGuy from '@eflexsystems/ember-data-factory-guy';
import Group from './group';

export default FactoryGuy.define('small-group', {
  extends: Group,
  sequences: {
    name: function (num) {
      return 'Small Group' + num;
    },
  },
  default: {
    type: 'small-group',
  },
});
