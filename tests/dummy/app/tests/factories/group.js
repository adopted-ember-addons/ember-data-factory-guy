import FactoryGuy from 'ember-data-factory-guy';

FactoryGuy.define('group', {
  default: {
    type: 'group',
    name: (f) => `Group-${f.id}`,
  },
  traits: {
    primary: {
      name: 'Primary Group',
    },
    parent: {
      name: 'Parent Group',
      group: null,
    },
  },
});
