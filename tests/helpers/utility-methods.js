import Ember from 'ember';
import FactoryGuy from 'ember-data-factory-guy';
import startApp from '../helpers/start-app';

// adapterType like -rest or -active-model, -json-api
let theUsualSetup = function (adapterType) {
  let App = startApp();

  // brute force setting the adapter/serializer on the store.
  if (adapterType) {
    let store = FactoryGuy.store;
    let adapter = App.__container__.lookup('adapter:'+adapterType);
    let serializer = App.__container__.lookup('serializer:'+adapterType);

    store.adapterFor = function() { return adapter; };

    // comic book will always be REST style serializer
    let comicBookSerializer = store.serializerFor('comic-book');
    store.serializerFor = function(modelName) {
      if (modelName==="comic-book") {
        return comicBookSerializer;
      }
      return serializer;
    };

    // this is cheesy .. but it works
    serializer.store = store;
    adapter.store = store;

    FactoryGuy.setStore(store);
  }

  $.mockjaxSettings.logging = false;
  $.mockjaxSettings.responseTime = 0;
  return App;
};

let theUsualTeardown = function (App) {
  Ember.run(function() {
    App.destroy();
    $.mockjax.clear();
  });
};

let inlineSetup = function (App,adapterType) {
  return {
    beforeEach: function () {
      App = theUsualSetup(adapterType);
    },
    afterEach: function () {
      theUsualTeardown(App);
    }
  };
};

let title = function (adapter, testName) {
  return [adapter, testName].join(' ');
};

export { title, inlineSetup, theUsualSetup, theUsualTeardown };
