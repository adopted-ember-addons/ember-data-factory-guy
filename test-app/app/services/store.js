import {
  macroCondition,
  dependencySatisfies,
  importSync,
} from '@embroider/macros';

// When using explicit @warp-drive/* packages (warp-drive-legacy ember-try scenario),
// configure the store with the full WarpDrive legacy setup.
// When using the ember-data umbrella package, use the simple re-export.
let StoreClass;
if (macroCondition(dependencySatisfies('@warp-drive/ember', '*'))) {
  const { default: Store, CacheHandler } = importSync('@ember-data/store');
  const { default: RequestManager } = importSync('@ember-data/request');
  const { default: Fetch } = importSync('@ember-data/request/fetch');
  const { default: JSONAPICache } = importSync('@ember-data/json-api');
  const {
    buildSchema,
    instantiateRecord,
    modelFor,
    teardownRecord,
  } = importSync('@ember-data/model');
  const {
    adapterFor,
    cleanup,
    LegacyNetworkHandler,
    normalize,
    pushPayload,
    serializeRecord,
    serializerFor,
  } = importSync('@ember-data/legacy-compat');

  class WarpDriveLegacyStore extends Store {
    requestManager = new RequestManager()
      .use([LegacyNetworkHandler, Fetch])
      .useCache(CacheHandler);

    createSchemaService() {
      return buildSchema(this);
    }

    createCache(capabilities) {
      return new JSONAPICache(capabilities);
    }

    instantiateRecord(key, createRecordArgs) {
      return instantiateRecord.call(this, key, createRecordArgs);
    }

    teardownRecord(record) {
      return teardownRecord.call(this, record);
    }

    modelFor(type) {
      return modelFor.call(this, type) || super.modelFor(type);
    }

    adapterFor = adapterFor;
    serializerFor = serializerFor;
    pushPayload = pushPayload;
    normalize = normalize;
    serializeRecord = serializeRecord;

    destroy() {
      cleanup.call(this);
      super.destroy();
    }
  }

  StoreClass = WarpDriveLegacyStore;
} else {
  StoreClass = importSync('ember-data/store').default;
}

export default StoreClass;
