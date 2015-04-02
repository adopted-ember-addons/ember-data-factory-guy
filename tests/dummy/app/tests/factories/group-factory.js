import FactoryGuy from 'ember-data-factory-guy/factory-guy';

FactoryGuy.define("group", {
  sequences: {
    name: function(num) {return 'Group' + num}
  },
  default: {
    type: "Group",
    name: FactoryGuy.generate('name')
  }
});

//import FactoryGuy from 'ember-data-factory-guy/factory-guy';
//FactoryGuy.define("big_group", {
//  sequences: {
//    name: function(num) {return 'Big Group' + num}
//  },
//  default: {
//    type: "BigGroup",
//    name: FactoryGuy.generate('name')
//  }
//});
//
//import FactoryGuy from 'ember-data-factory-guy/factory-guy';
//FactoryGuy.define("small_group", {
//  sequences: {
//    name: function(num) {return 'Small Group' + num}
//  },
//  default: {
//    type: "SmallGroup",
//    name: FactoryGuy.generate('name')
//  }
//});
