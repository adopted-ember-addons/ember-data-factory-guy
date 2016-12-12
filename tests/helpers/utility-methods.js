import Ember from 'ember';
import FactoryGuy, {makeList, manualSetup} from 'ember-data-factory-guy';
import DS from 'ember-data';
import DRFAdapter from 'ember-django-adapter/adapters/drf';
import DRFSerializer from 'ember-django-adapter/serializers/drf';
import ActiveModelAdapter from 'active-model-adapter';
import {ActiveModelSerializer} from 'active-model-adapter';

//// custom adapter options for the various models
//// which are applied to the currently testing model's adapter ( JSONAPI, REST, ActiveModel, etc )
//const adapterOptions = {
//  employee: {
//    buildURL(modelName, id, snapshot, requestType, query)  {
//      const url = this._super(modelName, id, snapshot, requestType, query);
//      const delimiter = (url.indexOf('?') !== -1) ? '&' : '?';
//      return `${url}${delimiter}company_id=12345`;
//    },
//    urlForFindRecord(id, modelName, snapshot) {
//      if (id === 'self') {
//        return '/user';
//      } else {
//        return this._super(id, modelName, snapshot);
//      }
//    }
//  }
//};

// custom serializer options for the various models 
// which are applied to the currently testing  model's serialier ( JSONAPI, REST, ActiveModel, etc ) 
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
  dog: {
    primaryKey: 'dogNumber'
  },
  cat: {
    primaryKey: 'catId',
    attrs: {
      name: { key: 'catName' },
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

function setupCustomAdapter(container, adapterType, options) {
  let store = container.lookup('service:store');
  let modelAdapter = container.lookup('adapter:' + adapterType);
  if (Ember.typeOf(options) === 'array') {
    modelAdapter.reopen.apply(modelAdapter, options);
  } else {
    modelAdapter.reopen(options);
  }
  modelAdapter.store = store;
  return modelAdapter;
}

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
function containerSetup(container, serializerType) {
  manualSetup(container);
  
  // brute force setting the adapter/serializer on the store.
  if (serializerType) {
    container.registry.register('adapter:-drf', DRFAdapter, { singleton: false });
    container.registry.register('serializer:-drf', DRFSerializer, { singleton: false });

    container.registry.register('adapter:-active-model', ActiveModelAdapter, { singleton: false });
    container.registry.register('serializer:-active-model', ActiveModelSerializer, { singleton: false });

    let store = container.lookup('service:store');

    let adapterType = serializerType === '-json' ? '-rest' : serializerType;
    let adapter = container.lookup('adapter:' + adapterType);

    serializerType = serializerType === '-json' ? '-default' : serializerType;
    let serializer = container.lookup('serializer:' + serializerType);

    store.adapterFor = function(modelName) {
//      if (modelName.match(/(employee)/)) {
//        let options = adapterOptions[modelName];
//        return setupCustomAdapter(container, adapterType, options);
//      }
      return adapter;
    };

    let findSerializer = store.serializerFor.bind(store);

    store.serializerFor = function(modelName) {
      // all the modelFragment types will use their own default serializer
      // and manager is always REST serializer ( used in rest tests )
      let originalSerializer = findSerializer(modelName);
      if (modelName.match(/(name|department|address|department-employment|manager)/)) {
        return originalSerializer;
      }
      if (modelName.match(/(entry|entry-type|comic-book|^cat$|^dog$)/)) {
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
}

function theUsualTeardown(App) {
  Ember.run(function() {
    $.mockjax.clear();
  });
}

function inlineSetup(serializerType) {
  return {
    integration: true,
    beforeEach: function() {
      Ember.$.mockjaxSettings.responseTime = 0;
      Ember.$.mockjaxSettings.logging = 1;
      FactoryGuy.settings({logLevel: 0});
      containerSetup(this.container, serializerType);
    }, 
    afterEach: function() {
      Ember.run(function() {
        $.mockjax.clear();
      });
    }
  };
}

function title(adapter, testName) {
  return [adapter, testName].join(' | ');
}

export {title, inlineSetup, containerSetup, theUsualTeardown};
