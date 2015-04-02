import FactoryGuy from 'ember-data-factory-guy/factory-guy';

FactoryGuy.define("outfit", {
  sequences: {
    name: function(num) {return 'Outfit' + num}
  },
  default: {
    name: FactoryGuy.generate('name')
  }
});
