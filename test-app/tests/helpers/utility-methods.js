import { EmbeddedRecordsMixin } from '@ember-data/serializer/rest';
import { assert } from '@ember/debug';
import FactoryGuy, { setupFactoryGuy } from 'ember-data-factory-guy';
import RESTAdapter from '@ember-data/adapter/rest';
import RESTSerializer from '@ember-data/serializer/rest';
import JSONSerializer from '@ember-data/serializer/json';
import JSONAPIAdapter from '@ember-data/adapter/json-api';
import JSONAPISerializer from '@ember-data/serializer/json-api';
import ActiveModelAdapter, {
  ActiveModelSerializer,
} from 'active-model-adapter';
import { getContext } from '@ember/test-helpers';

function baseAdapterFor(serializerType) {
  switch (serializerType) {
    case '-active-model':
      return ActiveModelAdapter;
    case '-rest':
      return RESTAdapter;
    case '-json':
      return RESTAdapter;
    case '-json-api':
      return JSONAPIAdapter;
  }
}
function baseSerializerFor(serializerType) {
  switch (serializerType) {
    case '-active-model':
      return ActiveModelSerializer;
    case '-rest':
      return RESTSerializer;
    case '-json':
      return JSONSerializer;
    case '-json-api':
      return JSONAPISerializer;
  }
}
function getBaseFor(serializerType) {
  return {
    adapter: baseAdapterFor(serializerType),
    serializer: baseSerializerFor(serializerType),
  };
}
function modelSerializerFor(modelName, SerializerClass) {
  switch (modelName) {
    case 'entry-type':
      return class EntryTypeSerializer extends SerializerClass {
        attrs = {
          entries: { serialize: true },
        };
        // don't pluralize the payload key.
        payloadKeyFromModelName(modelName) {
          return modelName;
        }
      };
    case 'entry':
      return class EntrySerializer extends SerializerClass {
        // don't pluralize the payload key.
        payloadKeyFromModelName(modelName) {
          return modelName;
        }
      };
    case 'dog':
      return class DogSerializer extends SerializerClass {
        primaryKey = 'dogNumber';
        attrs = {
          owner: { key: 'humanId' },
        };
      };
    case 'cat':
      return class CatSerializer extends SerializerClass {
        primaryKey = 'catId';
        attrs = {
          name: { key: 'catName' },
          friend: 'catFriend',
        };
      };
    case 'comic-book':
      return class ComicBookSerializer extends SerializerClass.extend(
        EmbeddedRecordsMixin,
      ) {
        attrs = {
          includedVillains: { embedded: 'always' },
          company: { embedded: 'always' },
          characters: { embedded: 'always' },
        };
      };
    default:
      return SerializerClass;
  }
}

// serializerType like -rest or -active-model, -json-api, -json
export function containerSetup(application, serializerType) {
  assert(
    'unexpected serializerType for test setup',
    ['-rest', '-active-model', '-json-api', '-json'].includes(serializerType),
  );

  const modelNames = [
    'big-group',
    'big-hat',
    'cat',
    'comic-book',
    'company',
    'cool-stoner',
    'dog',
    'employee',
    'entry-type',
    'entry',
    'fluffy-material',
    'group',
    'hat',
    'manager',
    'material',
    'outfit',
    'person',
    'philosopher',
    'profile',
    'project',
    'property',
    'review',
    'rod',
    'salary',
    'small-company',
    'small-group',
    'small-hat',
    'soft-material',
    'stoner',
    'super-hero',
    'user',
    'villain',
  ];

  const { adapter, serializer } = getBaseFor(serializerType);
  application.register(`adapter:application`, adapter);
  application.register(`serializer:application`, serializer);
  application.register(`adapter:${serializerType}`, adapter);
  application.register(`serializer:${serializerType}`, serializer);

  modelNames.forEach((modelName) => {
    application.register(`adapter:${modelName}`, adapter);

    // manager is always rest serializer, see real file
    if (modelName === 'manager') return;

    application.register(
      `serializer:${modelName}`,
      modelSerializerFor(modelName, serializer),
    );
  });
}

export function inlineSetup(hooks, serializerType) {
  setupFactoryGuy(hooks);
  hooks.beforeEach(function () {
    containerSetup(getContext().owner, serializerType);
    FactoryGuy.settings({ logLevel: 0 });
  });
}

export function title(adapter, testName) {
  return [adapter, testName].join(' | ');
}
