import FactoryGuy from 'ember-data-factory-guy';
import './group';

FactoryGuy.define("big-group", {
  extends: 'group',
  sequences: {
    name: function(num) {return 'Big Group' + num;}
  },
  default: {
    type: "BigGroup"
  }
});
