# WarpDrive Compatibility

## Background

[WarpDrive](https://warp-drive.io) is the spiritual successor and evolution of Ember Data. The
`ember-data` umbrella package is being decomposed into explicit `@warp-drive/*` and `@ember-data/*`
packages. Users will migrate in stages, so we need to remain compatible across the full range:

1. **Classic Ember Data** (`ember-data` umbrella, `@ember-data/model`) — the current majority of users
2. **WarpDrive legacy mode** — explicit `@warp-drive/*` packages, still using `@ember-data/model`,
   `@ember-data/adapter`, `@ember-data/serializer` via `@ember-data/legacy-compat`
3. **WarpDrive schema-record mode** — `@warp-drive/schema-record`, no adapters/serializers (future work)

---

## Compatibility Analysis

### What already works (no changes needed)

| Feature | Why |
|---------|-----|
| `store.push(data)` | Core public API retained in WarpDrive |
| `store.createRecord()` | Retained with legacy-compat |
| `store.peekRecord()` | Core public API |
| Factory definition system (`define`, `build`, `make`) | Pure JS, no ember-data dependency |
| MSW / Pretender interceptors | Completely independent of ember-data |

### What breaks without `@ember-data/legacy-compat`

| Code location | API used | WarpDrive status |
|---------------|----------|-----------------|
| `fixture-builder-factory.js` | `store.serializerFor()` | Removed from core; needs legacy-compat |
| `fixture-converter.js:86` | `store.serializerFor()` for primary key | Same |
| `fixture-converter.js:121` | `store.serializerFor()` for attr inclusion | Same |
| `fixture-converter.js:134` | `store.serializerFor()` for key transform | Same |
| `fixture-converter.js:184` | `store.modelFor().eachAttribute()` | Needs legacy-compat |
| `fixture-converter.js:217` | `store.modelFor().eachRelationship()` | Needs legacy-compat |
| `fixture-builder.js:31` | `store.modelFor().relationshipsByName` | Needs legacy-compat |
| `factory-guy.js:33` | `aStore instanceof Store` | May fail with non-umbrella store |
| `factory-guy.js:484` | `store.adapterFor()` + `adapter.buildURL()` | Removed from core; needs legacy-compat |
| `factory-guy.js:506` | `store.adapterFor` in cacheOnlyMode | Same |

### Summary

As long as `@ember-data/legacy-compat` is installed and the store is configured with
`adapterFor`, `serializerFor`, and `modelFor` hooks, this library should work with
WarpDrive legacy mode. The `instanceof Store` check is the only code change likely needed
in the library itself.

---

## Plan: Add WarpDrive Legacy Test Scenario

The goal is to add an `ember-try` scenario to the existing test-app that runs the full
test suite against a WarpDrive legacy-mode setup, so we can verify and track compatibility.

### WarpDrive Legacy Packages

When NOT using the `ember-data` umbrella, these packages are needed:

| Package | Purpose |
|---------|---------|
| `@warp-drive/ember` | Ember reactivity integration |
| `@ember-data/store` | Core store class |
| `@ember-data/model` | Classic `@attr`, `@belongsTo`, `@hasMany` |
| `@ember-data/adapter` | Classic REST/JSON:API adapter |
| `@ember-data/serializer` | Classic serializer |
| `@ember-data/legacy-compat` | Restores `adapterFor`, `serializerFor`, `modelFor`, `pushPayload` |
| `@ember-data/json-api` | JSON:API cache |
| `@ember-data/request` | Request manager |
| `@ember-data/request-utils` | Cache policy |
| `@warp-drive/build-config` | Build config helper (**already installed**) |

### WarpDrive Store Setup (Legacy Mode)

The store service needs to be updated from the simple re-export to an explicit configuration:

```js
// app/services/store.js
import Store, { CacheHandler } from '@ember-data/store';
import RequestManager from '@ember-data/request';
import Fetch from '@ember-data/request/fetch';
import JSONAPICache from '@ember-data/json-api';
import {
  buildSchema,
  instantiateRecord,
  modelFor,
  teardownRecord,
} from '@ember-data/model';
import {
  adapterFor,
  cleanup,
  LegacyNetworkHandler,
  normalize,
  pushPayload,
  serializeRecord,
  serializerFor,
} from '@ember-data/legacy-compat';

export default class AppStore extends Store {
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
```

### app/app.js Change

Add the side-effect import that wires up WarpDrive's Ember reactivity:

```js
import '@warp-drive/ember/install';
```

### ember-try Scenario

In `test-app/config/ember-try.js`, add:

```js
{
  name: 'warp-drive-legacy',
  npm: {
    devDependencies: {
      'ember-data': null, // remove umbrella
      'ember-source': '~5.12',
      'ember-load-initializers': '^3.0.0',
      '@warp-drive/ember': '<version>',
      '@ember-data/store': '<version>',
      '@ember-data/model': '<version>',
      '@ember-data/adapter': '<version>',
      '@ember-data/serializer': '<version>',
      '@ember-data/legacy-compat': '<version>',
      '@ember-data/json-api': '<version>',
      '@ember-data/request': '<version>',
      '@ember-data/request-utils': '<version>',
    },
  },
},
```

> **Important**: All `@ember-data/*` packages must be pinned to the **same** version.

### Steps

- [ ] Research and confirm matching versions of all `@warp-drive/*` and `@ember-data/*` packages
- [ ] Add `warp-drive-legacy` scenario to `test-app/config/ember-try.js`
- [ ] Update `test-app/app/services/store.js` to the explicit WarpDrive setup (while keeping it
      working with the default `ember-data` scenario using `@embroider/macros`)
- [ ] Add `@warp-drive/ember/install` import to `test-app/app/app.js`
- [ ] Run `ember try:one warp-drive-legacy` from `test-app/` and record results
- [ ] Document failures and map to known issues above

### Known Risk: `instanceof Store` check

In `addon/src/factory-guy.js`, the `setStore` assertion:

```js
assert('...', aStore instanceof Store); // Store from @ember-data/store
```

When the store is a subclass (as required by WarpDrive legacy mode), `instanceof` should
still work. But if `@ember-data/store` versions mismatch between the addon's dev-dep and
the app, this check could fail. This assertion may need to be loosened to a duck-type check.
