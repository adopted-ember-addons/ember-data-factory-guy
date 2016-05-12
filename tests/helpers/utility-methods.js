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
    
    let findSerializer = store.serializerFor.bind(store);

    store.serializerFor = function(modelName) {
      // comic book will always be REST style serializer
      // all the modelFragment types will use their own default serializer
      let originalSerializer = findSerializer(modelName);
      if (modelName.match(/(comic-book|name|department|address|department-employment|manager)/)) {
        return originalSerializer;
      }
      // cat serialzer will always declare special primaryKey for test purposes
      // but don't want to create serializer for cat, because this way allows the
      // serializer to change from JSONAPI, to REST style at will ( of the test )
      if (modelName === 'cat') {
        originalSerializer.set('primaryKey', 'catId');
        return originalSerializer;
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
