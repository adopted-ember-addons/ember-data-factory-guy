# Quick Start

## Installation

You can install `ember-data-factory-guy` using the Ember package installer:

```bash
ember install ember-data-factory-guy
```

Or you can install it using your favorite package manager:

```bash
npm install ember-data-factory-guy --save-dev
```

```bash
yarn add --dev ember-data-factory-guy
```

```bash
pnpm add -D ember-data-factory-guy
```

## How it works

Factory Guy works by:

- defining factories for your models
- use them to create records in the Store using the built-in build strategies.

The build strategies allow you to either create new records, persisted ones, or just build a JSON payload for your model
for mocking an HTTP request's payload.

## Requirements

### Import Factories

Factory Guy needs to be made aware of any factory files you define (see [Defining Factories](defining-factories.md)). This can be done by importing the factory files, which register themselves with FactoryGuy.

A clean way to do this is, if your test-helper.js is a module, to use an import glob before your tests run, to import them all.

```js
// tests/test-helper.js
import Application from 'my-app/app';
import config from 'my-app/config/environment';
import { setApplication } from '@ember/test-helpers';
import { start } from 'ember-qunit';

import.meta.glob('./factories/**/*.{js,ts}'); // this line here

/* existing test-helper.js setup code */
export async function start() {
  setApplication(Application.create(config.APP));
  start();
}
```

`import.meta.glob()` should be accesible in embroider or vite, or via this polyfill package https://github.com/NullVoxPopuli/ember-classic-import-meta-glob

If those options don't work for you, you can import the factories individually with regular import statements in the test-helper.js file.

```js
// tests/factories.js

import 'my-app/tests/factories/big-group';
import 'my-app/tests/factories/big-hat';
import 'my-app/tests/factories/project';
import 'my-app/tests/factories/user';
...
```

And import that file before your tests run - for example, in your test-helper file.

```js
// tests/test-helper.js
import Application from 'my-app/app';
import config from 'my-app/config/environment';
import { setApplication } from '@ember/test-helpers';
import { start } from 'ember-qunit';

import 'my-app/tests/factories'; // this line here

/* existing test-helper.js setup code */
setApplication(Application.create(config.APP));
start();
```

### Test Setup

FactoryGuy also needs to run some setup/teardown code before/after each test, use the `setupFactoryGuy(hooks)` method in your qunit tests to do this. This will allow you to use factories, mocks, and anything else from factory guy in tests,

```js
import { setupFactoryGuy, make } from 'ember-data-factory-guy';

module('Acceptance | User View', function (hooks) {
  setupApplicationTest(hooks);
  setupFactoryGuy(hooks);

  test('blah blah', async function (assert) {
    make('user');

    await visit('work');

    assert.ok(true);
  });
});
```

And then in your tests you can use your factories (whether thats acceptance, integration or unit tests).

```js
import { setupFactoryGuy, make } from 'ember-data-factory-guy';

module('Acceptance | User View', function (hooks) {
  setupRenderingTest(hooks);
  setupFactoryGuy(hooks);

  test('blah blah', async function (assert) {
    this.user = make('user');

    await render(hbs`<SingleUser @user={{this.user}}>`);

    assert.ok(true);
  });
});
```

## Configuration

Configuration can be provided to ember-data-factory-guy like this. I believe this also requires that your application
has `@embroider/macros` installed.

```ts
// ember-cli-build.js
let app = new EmberApp(defaults, {
  '@embroider/macros': {
    setConfig: {
      'ember-data-factory-guy': {
        useStringIdsOnly: true,
        interceptor: 'msw', // or 'pretender'
      },
    },
  },
});
```

- `useStringIdsOnly`

Later versions of ember-data (5+) require strings for ids, else it will throw deprecations.
https://deprecations.emberjs.com/ember-data/v5.x/#toc_ember-data-deprecate-non-strict-id

Recommended to set `useStringIdsOnly` config to have Factory Guy also only use string ids internally. This can be
acheived with `@embroider/macros` (make sure to add it as a devDependency)
https://github.com/embroider-build/embroider/tree/main/packages/macros#setting-configuration-from-an-ember-app

If enabled, this will also trigger assert() calls to ensure that any ids you provide to Factory Guy via functions like
`make*()`, `build*()`, `mock*()` etc are strings as well.

- `interceptor`

Defaults to 'pretender', can be set to 'msw'. Determines which library to use, by default, for intercepting and handling
requests. Whichever you choose, you will need to have that dependency listed in your application. Can be overridden in
any test module by providing a request manager of your choice to setupFactoryGuy()
