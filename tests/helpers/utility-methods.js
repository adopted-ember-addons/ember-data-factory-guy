import { EmbeddedRecordsMixin } from '@ember-data/serializer/rest';
import { typeOf } from '@ember/utils';
import FactoryGuy, { manualSetup } from 'ember-data-factory-guy';
import RESTAdapter from '@ember-data/adapter/rest';
import { param } from 'ember-data-factory-guy/utils/helper-functions';
import { getContext } from '@ember/test-helpers';
// TODO: Remove the need for this mixin
// eslint-disable-next-line ember/no-mixins

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
//// which are applied to the currently testing model's adapter ( JSONAPI, REST, etc )
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
// which are applied to the currently testing  model's serializer ( JSONAPI, REST, etc )
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

// serializerType like rest or json-api
export function containerSetup(application, type) {
  // brute force setting the adapter/serializer on the store.
  if (type) {
    let store = application.lookup('service:store');

    let adapter;
    if (type === 'rest') {
      application.register(`adapter:rest`, RESTAdapter, {
        singleton: false,
      });
    }
    adapter = application.lookup(`adapter:${type}`);

    let serializer = application.lookup('serializer:' + type);

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
        return setupCustomSerializer(application, type, options);
      }
      return serializer;
    };

    // this is cheesy .. but it works
    serializer.store = store;
    adapter.store = store;
  }
}

export function inlineSetup(hooks, serializerType) {
  hooks.beforeEach(function () {
    manualSetup(getContext());
    containerSetup(getContext().owner, serializerType);
    FactoryGuy.settings({ responseTime: 0, logLevel: 0 });
  });
}

export function title(adapter, testName) {
  return [adapter, testName].join(' | ');
}
