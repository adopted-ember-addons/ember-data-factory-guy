import FactoryGuy from '@eflexsystems/ember-data-factory-guy';

export default FactoryGuy.define('group', {
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
