import FactoryGuy from 'ember-data-factory-guy';

FactoryGuy.define('model-with-onload', {
  default: {
    name: 'Some name'
  },
  afterMake: function(model) {
    model.set('name', `${model.get('name')} -set in afterMake-`);
  }
});
