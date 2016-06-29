import FactoryGuy from 'ember-data-factory-guy';

FactoryGuy.define("group", {
  sequences: {
    name: function(num) {return 'Group' + num;}
  },
  default: {
    type: "Group",
    name: FactoryGuy.generate('name')
  }
});