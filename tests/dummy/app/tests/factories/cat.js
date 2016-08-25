import FactoryGuy from 'ember-data-factory-guy';

FactoryGuy.define('cat', {
  polymorphic: false,
  default: {
    // usually, an attribute named 'type' is for polymorphic models, but the defenition
    // is set as NOT polymorphic, which allows this type to work as attibute
    type: 'Cute',
    name: (f)=> `Cat ${f.id}`,
    friend: (f)=> `Friend ${f.id}`
  }
});
