import FactoryGuy from 'ember-data-factory-guy';
import './group';

FactoryGuy.define('small-group', {
  extends: 'group',
  sequences: {
    name: function (num) {
      return 'Small Group' + num;
    },
  },
  default: {
    type: 'SmallGroup',
  },
});
