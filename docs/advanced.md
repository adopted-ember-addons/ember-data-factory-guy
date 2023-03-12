# Advanced

## Using in other environments

- You can set up scenarios for your app that use all your factories from tests updating `config/environment.js`.

- NOTE: Do not use settings in the `test` environment. Factories are enabled
  by default for the `test` environment and setting the flag tells factory-guy to load the app/scenarios
  files which are not needed for using factory-guy in testing. This will result in errors being generated if
  the app/scenarios files do not exist.

  ```javascript
  // file: config/environment.js
  // in development you don't have to set enabled to true since that is default
  if (environment === 'development') {
    ENV.factoryGuy = { useScenarios: true };
    ENV.locationType = 'auto';
    ENV.rootURL = '/';
  }

  // or

  if (environment === 'production') {
    ENV.factoryGuy = { enabled: true, useScenarios: true };
    ENV.locationType = 'auto';
    ENV.rootURL = '/';
  }
  ```

- Place your scenarios in the `app/scenarios` directory

  - Start by creating at least a `scenarios/main.js` file since this is the starting point
  - Your scenario classes should inherit from `Scenario` class
  - A scenario class should declare a run method where you do things like:
    - include other scenarios
      - you can compose scenarios like a symphony of notes
    - make your data or mock your requests using the typical Factory Guy methods
      - these methods are all built into scenario classes so you don't have to import them

  ```javascript
  // file: app/scenarios/main.js
  import { Scenario } from 'ember-data-factory-guy';
  import Users from './users';

  // Just for fun, set the log level ( to 1 ) and see all FactoryGuy response info in console
  Scenario.settings({
    logLevel: 1, // 1 is the max for now, default is 0
  });

  export default class extends Scenario {
    run() {
      this.include([Users]); // include other scenarios
      this.mockFindAll('products', 3); // mock some finds
      this.mock({
        type: 'POST',
        url: '/api/v1/users/sign_in',
        responseText: { token: '0123456789-ab' },
      }); // mock a custom endpoint
    }
  }
  ```

  ```javascript
  // file: app/scenarios/users.js
  import { Scenario } from 'ember-data-factory-guy';

  export default class extends Scenario {
    run() {
      this.mockFindAll('user', 'boblike', 'normal');
      this.mockDelete('user');
    }
  }
  ```

## Ember Data Model Fragments

As of 2.5.2 you can create factories which contain [ember-data-model-fragments](https://github.com/lytics/ember-data-model-fragments). Setting up your fragments is easy and follows the same process as setting up regular factories. The mapping between fragment types and their associations are like so:

| Fragment Type   | Association            |
| --------------- | ---------------------- |
| `fragment`      | `FactoryGuy.belongsTo` |
| `fragmentArray` | `FactoryGuy.hasMany`   |
| `array`         | `[]`                   |

For example, say we have the following `Employee` model which makes use of the `fragment`, `fragmentArray` and `array` fragment types.

```javascript
// Employee model
export default Model.extend({
  name: fragment('name'),
  phoneNumbers: fragmentArray('phone-number')
})

// Name fragment
export default Fragment.extend({
  titles: array('string'),
  firstName: attr('string'),
  lastName: attr('string')
});

// Phone Number fragment
export default Fragment.extend({
  number: attr('string')
  type: attr('string')
});
```

A factory for this model and its fragments would look like so:

```javascript
// Employee factory
FactoryGuy.define('employee', {
  default: {
    name: FactoryGuy.belongsTo('name'), //fragment
    phoneNumbers: FactoryGuy.hasMany('phone-number'), //fragmentArray
  },
});

// Name fragment factory
FactoryGuy.define('name', {
  default: {
    titles: ['Mr.', 'Dr.'], //array
    firstName: 'Jon',
    lastName: 'Snow',
  },
});

// Phone number fragment factory
FactoryGuy.define('phone-number', {
  default: {
    number: '123-456-789',
    type: 'home',
  },
});
```

To set up associations manually ( and not necessarily in a factory ), you should do:

```js
let phoneNumbers = makeList('phone-numbers', 2);
let employee = make('employee', { phoneNumbers });

// OR

let phoneNumbers = buildList('phone-numbers', 2).get();
let employee = build('employee', { phoneNumbers }).get();
```

For a more detailed example of setting up fragments have a look at:

- model test [employee test](https://github.com/adopted-ember-addons/ember-data-factory-guy/blob/master/tests/unit/models/employee-test.js).
- acceptance test [employee-view-test](https://github.com/adopted-ember-addons/ember-data-factory-guy/blob/master/tests/acceptance/employee-view-test.js).

## Creating Factories in Addons

If you are making an addon with factories and you want the factories available to Ember apps using your addon, place the factories in `addon-test-support/factories` instead of `tests/factories`. They should be available both within your addon and in Ember apps that use your addon.

## Ember Django Adapter

- available since 2.6.1
- everything is setup automatically
- sideloading is not supported in `DRFSerializer` so all relationships should either
  - be set as embedded with `DS.EmbeddedRecordsMixin` if you want to use `build`/`buildList`
  - or use `make`/`makeList` and in your mocks, and return models instead of json:

```javascript
let projects = makeList('projects', 2); // put projects in the store
let user = make('user', { projects }); // attach them to user
mockFindRecord('user').returns({ model: user }); // now the mock will return a user that has projects
```

- using `fails()` with errors hash is not working reliably
  - so you can always just `mockWhatever(args).fails()`

## Tips and Tricks

### Tip 1: Fun with `makeList`/`buildList` and traits

- This is probably the funnest thing in FactoryGuy, if you're not using this
  syntax yet, you're missing out.

```javascript
let json = buildList('widget', 'square', 'round', ['round', 'broken']);
let widgets = makeList('widget', 'square', 'round', ['round', 'broken']);
let [squareWidget, roundWidget, roundBrokenWidget] = widgets;
```

    - you just built/made 3 different widgets from traits ('square', 'round', 'broken')
    - the first will have the square trait
    - the second will have the round trait
    - the third will have both round and broken trait

### Tip 2: Building static / fixture like data into the factories.

- States are the classic case. There is a state model, and there are 50 US states.
- You could use a strategy to get them with traits like this:

```javascript
import FactoryGuy from 'ember-data-factory-guy';

FactoryGuy.define('state', {
  traits: {
    NY: { name: 'New York', id: 'NY' },
    NJ: { name: 'New Jersey', id: 'NJ' },
    CT: { name: 'Connecticut', id: 'CT' },
  },
});

// then in your tests you would do
let [ny, nj, ct] = makeList('state', 'ny', 'nj', 'ct');
```

- Or you could use a strategy to get them like this:

```javascript
  import FactoryGuy from 'ember-data-factory-guy';

  const states = [
    { name: "New York", id: "NY" },
    { name: "New Jersey", id: "NJ" },
    { name: "Connecticut", id: "CT" }
    ... blah .. blah .. blah
  ];

  FactoryGuy.define('state', {

    default: {
      id: FactoryGuy.generate((i)=> states[i-1].id),
      name: FactoryGuy.generate((i)=> states[i-1].name)
    }
  });

  // then in your tests you would do
  let states = makeList('state', 3); // or however many states you have
```

### Tip 3: Using Scenario class in tests

- encapsulate data interaction in a scenario class
  - sets up data
  - has helper methods to retrieve data
- similar to how page objects abstract away the interaction with a page/component

Example:

```javascript
// file: tests/scenarios/admin.js
import Ember from 'ember';
import { Scenario } from 'ember-data-factory-guy';

export default class extends Scenario {
  run() {
    this.createGroups();
  }

  createGroups() {
    this.permissionGroups = this.makeList('permission-group', 3);
  }

  groupNames() {
    return this.permissionGroups.mapBy('name').sort();
  }
}

// file: tests/acceptance/admin-view-test.js
import page from '../pages/admin';
import Scenario from '../scenarios/admin';

describe('Admin View', function () {
  let scenario;

  beforeEach(function () {
    scenario = new Scenario();
    scenario.run();
  });

  describe('group', function () {
    beforeEach(function () {
      page.visitGroups();
    });

    it('shows all groups', function () {
      expect(page.groups.names).to.arrayEqual(scenario.groupNames());
    });
  });
});
```

### Tip 4: Testing mocks ( async testing ) in unit tests

- Two ways to handle asyncronous test
  - async / await ( most elegant ) [Sample test](https://github.com/adopted-ember-addons/ember-data-factory-guy/blob/master/tests/unit/models/user-test.js#L44)
    - need to declare polyfill for ember-cli-babel options
      in [ember-cli-build](https://github.com/adopted-ember-addons/ember-data-factory-guy/blob/master/ember-cli-build.js#L7)
  - using `assert.async()` (qunit) / `done` (mocha) [Sample test](https://github.com/adopted-ember-addons/ember-data-factory-guy/blob/master/tests/unit/models/user-test.js#L53)

### Tip 5: Testing model's custom `serialize()` method

- The fact that you can match on attributes in `mockUpdate` and `mockCreate` means
  that you can test a custom `serialize()` method in a model serializer

```javascript
// app/serializers/person.js
export default DS.RESTSerializer.extend({
  // let's say you're modifying all names to be Japanese honorific style
  serialize: function (snapshot, options) {
    var json = this._super(snapshot, options);

    let honorificName = [snapshot.record.get('name'), 'san'].join('-');
    json.name = honorificName;

    return json;
  },
});

// somewhere in your tests
let person = make('person', { name: 'Daniel' });
mockUpdate(person).match({ name: 'Daniel-san' });
person.save(); // will succeed
// and voila, you have just tested the serializer is converting the name properly
```

- You could also test `serialize()` method in a simpler way by doing this:

```javascript
let person = make('person', { name: 'Daniel' });
let json = person.serialize();
assert.equal(json.name, 'Daniel-san');
```

## Custom API formats

FactoryGuy handles JSON-API / RESTSerializer / JSONSerializer out of the box.

In case your API doesn't follow any of these conventions, you can still make a custom fixture builder
or modify the `FixtureConverters` and `JSONPayload` classes that exist.

- before I launch into the details, let me know if you need this hookup and I
  can guide you to a solution, since the use cases will be rare and varied.

### `FactoryGuy.cacheOnlyMode`

- Allows you to setup the adapters to prevent them from fetching data with ajax calls
  - for single models ( `findRecord` ) you have to put something in the store
  - for collections ( `findAll` ) you don't have to put anything in the store
- Takes `except` parameter as a list of models you don't want to cache
  - These model requests will go to the server with ajax calls and will need to be mocked

This is helpful, when:

- you want to set up the test data with `make`/`makeList`, and then prevent
  calls like `store.findRecord` or `store.findAll` from fetching more data, since you have
  already setup the store with `make`/`makeList` data.
- you have an application that starts up and loads data that is not relevant
  to the test page you are working on.

Usage:

```javascript
import FactoryGuy, { makeList } from 'ember-data-factory-guy';
import moduleForAcceptance from '../helpers/module-for-acceptance';

moduleForAcceptance('Acceptance | Profiles View');

test('Using FactoryGuy.cacheOnlyMode', async function () {
  FactoryGuy.cacheOnlyMode();
  // the store.findRecord call for the user will go out unless there is a user
  // in the store
  make('user', { name: 'current' });
  // the application starts up and makes calls to findAll a few things, but
  // those can be ignored because of the cacheOnlyMode

  // for this test I care about just testing profiles
  makeList('profile', 2);

  await visit('/profiles');

  // test stuff
});

test('Using FactoryGuy.cacheOnlyMode with except', async function () {
  FactoryGuy.cacheOnlyMode({ except: ['profile'] });

  make('user', { name: 'current' });

  // this time I want to allow the ajax call so I can return built json payload
  mockFindAll('profile', 2);

  await visit('/profiles');

  // test stuff
});
```
