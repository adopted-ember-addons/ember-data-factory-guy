# Upgrading

## v4 -> v5

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

- Add a `tests/factories.js` file that imports all your factories
  - example https://github.com/adopted-ember-addons/ember-data-factory-guy/blob/ed50331e5bd414f6ffa2b5a1e52966ff55e5116d/test-app/tests/factories.js#L1-L33
- Add `import 'my-app/tests/factories';` to your `tests/test-helper.js` file
  - example https://github.com/adopted-ember-addons/ember-data-factory-guy/blob/ed50331e5bd414f6ffa2b5a1e52966ff55e5116d/test-app/tests/test-helper.js#L8

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
