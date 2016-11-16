import FactoryGuy from 'ember-data-factory-guy';

FactoryGuy.define("group", {
  sequences: {
    name: (num)=>`Group ${num}`
  },
  default: {
    type: "Group",
    name: FactoryGuy.generate('name')
  },
  traits: {
    primary: {
      name: 'Primary Group',
      group: FactoryGuy.belongsTo('group', 'parent')
    },
    parent: {
      name: 'Parent Group',
      group: null
    }
  }
});