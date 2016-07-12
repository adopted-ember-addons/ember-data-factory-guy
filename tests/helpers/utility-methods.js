import Ember from 'ember';
import FactoryGuy from 'ember-data-factory-guy';
import startApp from '../helpers/start-app';
import DS from 'ember-data';
import DRFAdapter from 'ember-django-adapter/adapters/drf';
import DRFSerializer from 'ember-django-adapter/serializers/drf';
import ActiveModelAdapter from 'active-model-adapter';
import {ActiveModelSerializer} from 'active-model-adapter';


// custom serializer options for the various models 
// which are applied to any serialier ( JSONAPI, REST, ActiveModel, etc ) 
const serializerOptions = {
  'entry-type': {
    attrs: {
      entries: { serialize: true }
    },
    // don't pluralize the payload key.
    payloadKeyFromModelName(modelName) {
      return modelName;
    }
  },
  entry: {
    // don't pluralize the payload key.
    payloadKeyFromModelName(modelName) {
      return modelName;
    }
  },
  cat: {
    primaryKey: 'catId',
    attrs: {
      name: {key: 'catName'},
      friend: 'catFriend'
    }
  },
  'comic-book': [
    DS.EmbeddedRecordsMixin, {
      attrs: {
        company: { embedded: 'always' }, characters: { embedded: 'always' }
      }
    }
  ]
};

function setupCustomSerializer(container, serializerType, options) {
  let store = container.lookup('service:store');
  let modelSerializer = container.lookup('serializer:' + serializerType);
  if (Ember.typeOf(options) === 'array') {
    modelSerializer.reopen.apply(modelSerializer, options);
  } else {
    modelSerializer.reopen(options);
  }
  modelSerializer.store = store;
  return modelSerializer;
}


// serializerType like -rest or -active-model, -json-api, -json
function theUsualSetup(serializerType) {
  let App = startApp();

  // brute force setting the adapter/serializer on the store.
  if (serializerType) {
    let container = App.__container__;
    container.registry.register('adapter:-drf', DRFAdapter, { singleton: false });
    container.registry.register('serializer:-drf', DRFSerializer, { singleton: false });

    container.registry.register('adapter:-active-model', ActiveModelAdapter, { singleton: false });
    container.registry.register('serializer:-active-model', ActiveModelSerializer, { singleton: false });

    let store = container.lookup('service:store');

    let adapterType = serializerType === '-json' ? '-rest' : serializerType;
    let adapter = container.lookup('adapter:' + adapterType);

    serializerType = serializerType === '-json' ? '-default' : serializerType;
    let serializer = container.lookup('serializer:' + serializerType);

    store.adapterFor = function() {
      return adapter;
    };

    let findSerializer = store.serializerFor.bind(store);

    store.serializerFor = function(modelName) {
      // all the modelFragment types will use their own default serializer
      let originalSerializer = findSerializer(modelName);
      if (modelName.match(/(name|department|address|department-employment|manager)/)) {
        return originalSerializer;
      }
      if (modelName.match(/(entry|entry-type|comic-book|^cat$)/)) {
        let options = serializerOptions[modelName];
        return setupCustomSerializer(container, serializerType, options);
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

function theUsualTeardown(App) {
  Ember.run(function() {
    App.destroy();
    $.mockjax.clear();
  });
}

function inlineSetup(App, adapterType) {
  return {
    beforeEach: function() {
      App = theUsualSetup(adapterType);
    },
    afterEach: function() {
      theUsualTeardown(App);
    }
  };
}

function title(adapter, testName) {
  return [adapter, testName].join(' | ');
}

export {title, inlineSetup, theUsualSetup, theUsualTeardown};
