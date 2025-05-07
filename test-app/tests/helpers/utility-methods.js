import { EmbeddedRecordsMixin } from '@ember-data/serializer/rest';
import { typeOf } from '@ember/utils';
import FactoryGuy, { setupFactoryGuy } from 'ember-data-factory-guy';
import RESTAdapter from '@ember-data/adapter/rest';
import ActiveModelAdapter, {
  ActiveModelSerializer,
} from 'active-model-adapter';
import { param } from 'ember-data-factory-guy/-private';
import { getContext } from '@ember/test-helpers';

export function fetchJSON({ url, params, method = 'GET' } = {}) {
  let body = '';
  if (method === 'GET') {
    url = [url, param(params)].join('?');
  } else {
    body = JSON.stringify(params);
  }
  return fetch(url, { body, method }).then((r) =>
    r._bodyText ? r.json() : null,
  );
}

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
// which are applied to the currently testing  model's serializer ( JSONAPI, REST, ActiveModel, etc )
const serializerOptions = {
  'entry-type': {
    attrs: {
      entries: { serialize: true },
    },
    // don't pluralize the payload key.
    payloadKeyFromModelName(modelName) {
      return modelName;
    },
  },
  entry: {
    // don't pluralize the payload key.
    payloadKeyFromModelName(modelName) {
      return modelName;
    },
  },
  dog: {
    primaryKey: 'dogNumber',
    attrs: {
      owner: { key: 'humanId' },
    },
  },
  cat: {
    primaryKey: 'catId',
    attrs: {
      name: { key: 'catName' },
      friend: 'catFriend',
    },
  },
  'comic-book': [
    EmbeddedRecordsMixin,
    {
      attrs: {
        includedVillains: { embedded: 'always' },
        company: { embedded: 'always' },
        characters: { embedded: 'always' },
      },
    },
  ],
};

//function setupCustomAdapter(container, adapterType, options) {
//  let store = container.lookup('service:store');
//  let modelAdapter = container.lookup('adapter:' + adapterType);
//  if (typeOf(options) === 'array') {
//    modelAdapter.reopen.apply(modelAdapter, options);
//  } else {
//    modelAdapter.reopen(options);
//  }
//  modelAdapter.store = store;
//  return modelAdapter;
//}

function setupCustomSerializer(container, serializerType, options) {
  let store = container.lookup('service:store');
  let modelSerializer = container.lookup('serializer:' + serializerType);
  if (typeOf(options) === 'array') {
    modelSerializer.reopen.apply(modelSerializer, options);
  } else {
    modelSerializer.reopen(options);
  }
  modelSerializer.store = store;
  return modelSerializer;
}

// serializerType like -rest or -active-model, -json-api, -json
export function containerSetup(application, serializerType) {
  // brute force setting the adapter/serializer on the store.
  if (serializerType) {
    application.register('adapter:-active-model', ActiveModelAdapter, {
      singleton: false,
    });
    application.register('serializer:-active-model', ActiveModelSerializer, {
      singleton: false,
    });

    let store = application.lookup('service:store');

    let adapterType = serializerType === '-json' ? '-rest' : serializerType;
    let adapter;
    if (serializerType === '-json' || serializerType === '-rest') {
      application.register(`adapter:-rest`, RESTAdapter, {
        singleton: false,
      });
    }
    adapter = application.lookup('adapter:' + adapterType);
    adapter = adapter.reopen();

    serializerType = serializerType === '-json' ? '-default' : serializerType;
    let serializer = application.lookup('serializer:' + serializerType);

    store.adapterFor = () => adapter;

    let findSerializer = store.serializerFor.bind(store);

    store.serializerFor = function (modelName) {
      // all the modelFragment types will use their own default serializer
      // and manager is always REST serializer ( used in rest tests )
      let originalSerializer = findSerializer(modelName);
      if (
        modelName.match(
          /(name|department|address|department-employment|manager)/,
        )
      ) {
        return originalSerializer;
      }
      if (modelName.match(/(entry|entry-type|comic-book|^cat$|^dog$)/)) {
        let options = serializerOptions[modelName];
        return setupCustomSerializer(application, serializerType, options);
      }
      return serializer;
    };

    // this is cheesy .. but it works
    serializer.store = store;
    adapter.store = store;
  }
}

export function inlineSetup(hooks, serializerType) {
  setupFactoryGuy(hooks);
  hooks.beforeEach(function () {
    containerSetup(getContext().owner, serializerType);
    FactoryGuy.settings({ responseTime: 0, logLevel: 0 });
  });
}

export function title(adapter, testName) {
  return [adapter, testName].join(' | ');
}
