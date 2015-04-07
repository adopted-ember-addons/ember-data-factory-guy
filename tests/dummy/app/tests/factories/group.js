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

FactoryGuy.define("big-group", {
  sequences: {
    name: function(num) {return 'Big Group' + num;}
  },
  default: {
    type: "BigGroup",
    name: FactoryGuy.generate('name')
  }
});

FactoryGuy.define("small-group", {
  sequences: {
    name: function(num) {return 'Small Group' + num;}
  },
  default: {
    type: "SmallGroup",
    name: FactoryGuy.generate('name')
  }
});
