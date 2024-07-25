import FactoryGuy from '@eflexsystems/ember-data-factory-guy';

export default FactoryGuy.define('cat', {
  polymorphic: false,
  default: {
    // usually, an attribute named 'type' is for polymorphic models, but the definition
    // is set as NOT polymorphic, which allows this type to work as attribute
    type: 'Cute',
    name: (f) => `Cat ${f.id}`,
    friend: (f) => `Friend ${f.id}`,
  },
});
