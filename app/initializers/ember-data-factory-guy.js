import FactoryGuy from 'ember-data-factory-guy/factory-guy';

export default {
  name: 'ember-data-factory-guy',
  after: 'store',

  initialize: function(container, application) {
    console.log('Hi Mom', container.lookup('store:main')+'', FactoryGuy.getStore()+'')
    FactoryGuy.setStore(container.lookup('store:main'))
  }
};
