# Request Manager

Provides the ability to choose whether you want Pretender or MockServiceWorker (MSW) to intercept requests. This is handled via a RequestManager. If you call `setupFactoryGuy(hooks)` in your module, `this.requestManager` will be set, giving you access to the RequestManager being used for the test, where you can directly access the interceptor or change settings. It's also available via `FactoryGuy.requestManager` if you cannot access the `this` test context, but it will only be set during test runs.

Pretender is currently the default request manager.

## via setConfig

You can choose your interceptor application-wide, by applying it in the config. This will use the appropriate RequestManager automatically. Can still be overridden per-test, this just sets the default when you don't provide a RequestManager.

```ts
// ember-cli-build.js
let app = new EmberApp(defaults, {
  '@embroider/macros': {
    setConfig: {
      'ember-data-factory-guy': {
        useStringIdsOnly: true,
        interceptor: 'msw', // 'pretender' is default
      },
    },
  },
});
```

## via setupFactoryGuy

Alternatively, you can choose which RequestManager to use for a module, by handing it to `setupFactoryGuy()`

```ts
import { RequestManagerMSW } from 'ember-data-factory-guy'
...
module('my module', function (hooks) {
  setupFactoryGuy(hooks, new RequestManagerMSW())

  test('my test', function () {
    mockCreate('thing')

    // define some custom msw endpoint if you like
    this.requestManager.worker.use(...)
  })
})
```

```ts
import { RequestManagePretender } from 'ember-data-factory-guy'
...
module('my module', function (hooks) {
  setupFactoryGuy(hooks, new RequestManagePretender())

  test('my test', function () {
    mockCreate('thing')

    // define some custom pretender endpoint if you like
    this.requestManager.pretender.get(...)
  })
})
```

## How to use pre-existing instance or worker

If you already have a pretender instance or msw worker created that you want Factory Guy to use, you can hand it to the request manager
constructor, and it will use that. It will also start it if not already started.

```ts
import Pretender from 'pretender';
const pretender = new Pretender();
new RequestManagerMSW(pretender);
```

```ts
import { setupWorker } from 'msw/browser';
const worker = setupWorker();
new RequestManagerMSW(worker);
```

Depending on how advanced your needs are, you may want to write your own equivalent to `setupFactoryGuy()` test helper.
