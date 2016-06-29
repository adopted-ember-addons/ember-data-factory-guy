import Ember from 'ember';
import FactoryGuy from 'ember-data-factory-guy';
import startApp from '../helpers/start-app';
import DS from 'ember-data';
import DRFAdapter from 'ember-django-adapter/adapters/drf';
import DRFSerializer from 'ember-django-adapter/serializers/drf';
import ActiveModelAdapter from 'active-model-adapter';
import { ActiveModelSerializer } from 'active-model-adapter';

// serializerType like -rest or -active-model, -json-api, -json
let theUsualSetup = function (serializerType) {
  let App = startApp();

  // brute force setting the adapter/serializer on the store.
  if (serializerType) {
    let container = App.__container__;
    container.registry.register('adapter:-drf', DRFAdapter, {singleton: false});
    container.registry.register('serializer:-drf', DRFSerializer, {singleton: false});

    container.registry.register('adapter:-active-model', ActiveModelAdapter, {singleton: false});
    container.registry.register('serializer:-active-model', ActiveModelSerializer, {singleton: false});

    let store = container.lookup('service:store');

    let adapterType = serializerType === '-json' ? '-rest' : serializerType;
    let adapter = container.lookup('adapter:' + adapterType);

    serializerType = serializerType === '-json' ? '-default' : serializerType;
    let serializer = container.lookup('serializer:' + serializerType);

    store.adapterFor = function() { return adapter; };

    let findSerializer = store.serializerFor.bind(store);

    store.serializerFor = function(modelName) {
      // all the modelFragment types will use their own default serializer
      let originalSerializer = findSerializer(modelName);
      if (modelName.match(/(name|department|address|department-employment|manager|entry|entry-type)/)) {
        return originalSerializer;
      }
      // comic-book is used in JSON, and REST serializer test and this allows it to be
      // dynamically both types in different tests
      if (modelName === 'comic-book') {
        let comicSerializer = container.lookup('serializer:' + serializerType);
        comicSerializer.reopen(DS.EmbeddedRecordsMixin, {
          attrs: {
            company: {embedded: 'always'}, characters: {embedded: 'always'}
          }
        });
        comicSerializer.store = store;
        return comicSerializer;
      }
      // cat serialzer will always declare special primaryKey for test purposes
      // but don't want to create serializer for cat, because doing it this way
      // allows the serializer to change from JSONAPI, REST, JSON style at will ( of the test )
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
  return [adapter, testName].join(' | ');
};

export { title, inlineSetup, theUsualSetup, theUsualTeardown };
