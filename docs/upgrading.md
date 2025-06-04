# Upgrading

## to v7

No longer supporting `ember-data-model-fragments`. Given that package is not being maintained, and is locked to < ember-data 4.6, I cannot see how support for it can be expected to be kept in other addons either, if those addons want to move forward with supporting later versions of ember-data and ember-source.

If you use `ember-data-model-fragments` with factory guy, you'll want to stick with factory guy v6 or earlier.

The silver lining, is this has unblocked us to explicitly upgrade the tests to run against ember-data 5.3 and ember-source 5.12 and 6.4.

TLDR; Now explicitly supporting;

- `ember-source` 4.12, 5.12, 6.4
- `ember-data` 5.3+

You can still likely run earlier versions of ember-data with factory guy, we're just not explicitly testing for that.

## to v6

Dropping dependencies for unsupported versions - shouldn't be any changes needed from your application, except for ensuring you're on;

- `ember-source` 4.12+
- `active-model-adapter` 4+ (if you use it)
- `ember-data-model-fragments` 6+ (if you use it)

## to v5

Users of `ember-django-adapter` will need to remain on v4. The addon is quite old and under-maintained, it required a fix to move factory guy forward which was unlikely to be merged.

Additionally, support for node versions before 16 has been dropped. Only 18, 20, 22+ are supported - ensure you are using one of these versions.

For this release, the addon has been converted to a "v2 addon", a number of peerDependencies have been added. You'll need to ensure your application has these dependencies listed;

- `ember-auto-import` (at least v2)
- `@ember-data/model`
- `@ember-data/serializer`
- `@ember-data/store`
- `@ember/string`
- `@ember/test-helpers`
- `ember-inflector`

The addon no longer uses `require()` to import and register your factory guy Factories and "main" Scenario. This means you need to import them yourself;

Factories

See [Requirements](quick-start.md#requirements)

- Add `import.meta.glob('./factories/**/*.{js,ts}')` to your `tests/test-helper.js` file

Scenario

- If you specified `useScenarios` in your config for factory guy so that it would run your "main" scenario located at `scenarios/main.js` - you'll instead want to import and run it anywhere you want to use it. This makes it just like any other scenario you might have defined.

```ts
import MainScenario from 'my-app/tests/scenarios/main';
MainScenario.run();
```

- If you didn't specify `useScenarios` config or have no idea what the main scenario is, you don't need to do anything.

`ENV.factoryGuy = {...};` config/environment object no longer does anything, you can remove it if you specified it. This includes both `enabled` and `useScenarios` options.

Explicit code to only include factory guy in test/development builds has been removed. We are now relying on tree-shaking - assuming you only use factory guy code in tests, then it will only be included when tests are (which should only be test/development builds). If this is you, you should not need to change anything regarding this.

- If you have more complex requirements than this, like using factory guy in your app code, make sure you wrap your usages of factory guy in `@embroider/macros` `importSync()` and with other conditional macros so that it is only included when you want it to be.
