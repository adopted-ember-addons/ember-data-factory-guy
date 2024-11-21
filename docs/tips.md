
### Tips and Tricks

#### Tip 1: Fun with `makeList`/`buildList` and traits

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

- Check out [makeList](#factoryguymakelist) and [buildList](#factoryguybuildlist) for more ideas

#### Tip 2: Building static / fixture like data into the factories.

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

#### Tip 3: Using Scenario class in tests

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

#### Tip 4: Testing mocks ( async testing ) in unit tests

- Two ways to handle asyncronous test
  - async / await ( most elegant ) [Sample test](https://github.com/adopted-ember-addons/ember-data-factory-guy/blob/master/tests/unit/models/user-test.js#L44)
    - need to declare polyfill for ember-cli-babel options
      in [ember-cli-build](https://github.com/adopted-ember-addons/ember-data-factory-guy/blob/master/ember-cli-build.js#L7)
  - using `assert.async()` (qunit) / `done` (mocha) [Sample test](https://github.com/adopted-ember-addons/ember-data-factory-guy/blob/master/tests/unit/models/user-test.js#L53)

#### Tip 5: Testing model's custom `serialize()` method

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
