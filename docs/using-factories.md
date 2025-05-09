# Using Factories

## Build strategies

- [`FactoryGuy.attributesFor`](#factoryguyattributesfor)
  - returns attributes ( for now no relationship info )
- [`FactoryGuy.make`](#factoryguymake)
  - push model instances into store
- [`FactoryGuy.makeNew`](#factoryguymakenew)
  - Create a new model instance but doesn't load it to the store
- [`FactoryGuy.makeList`](#factoryguymakelist)
  - Loads zero to many model instances into the store
- [`FactoryGuy.build`](#factoryguybuild)
  - Builds json in accordance with the adapter's specifications
    - [RESTAdapter](http://emberjs.com/api/data/classes/DS.RESTAdapter.html) (_assume this adapter being used in most of the following examples_)
    - [ActiveModelAdapter](https://github.com/ember-data/active-model-adapter#json-structure)
    - [JSONAPIAdapter](http://jsonapi.org/format/)
- [`FactoryGuy.buildList`](#factoryguybuildlist)
  - Builds json with a list of zero or more items in accordance with the adapter's specifications
- Can override default attributes by passing in an object of options
- Can add attributes or relationships with [traits](#traits)
- Can compose relationships
  - By passing in other objects you've made with `build`/`buildList` or `make`/`makeList`
- Can setup links for async relationships with `build`/`buildList` or `make`/`makeList`

### `FactoryGuy.attributesFor`

- nice way to get attibutes for a factory without making a model or payload
- same arguments as make/build
- no id is returned
- no relationship info returned ( yet )

```javascript
import { attributesFor } from 'ember-data-factory-guy';

// make a user with certain traits and options
attributesFor('user', 'silly', { name: 'Fred' }); // => { name: 'Fred', style: 'silly'}
```

### `FactoryGuy.make`

- Loads a model instance into the store
- makes a fragment hash ( if it is a model fragment )
- can compose relationships with other `FactoryGuy.make`/`FactoryGuy.makeList`
- can add relationship links to payload

```javascript
import { make } from 'ember-data-factory-guy';

// make a user with the default attributes in user factory
let user = make('user');
user.toJSON({ includeId: true }); // => {id: 1, name: 'User1', style: 'normal'}

// make a user with the default attributes plus those defined as 'admin' in the user factory
let user = make('admin');
user.toJSON({ includeId: true }); // => {id: 2, name: 'Admin', style: 'super'}

// make a user with the default attributes plus these extra attributes provided in the optional hash
let user = make('user', { name: 'Fred' });
user.toJSON({ includeId: true }); // => {id: 3, name: 'Fred', style: 'normal'}

// make an 'admin' user with these extra attributes
let user = make('admin', { name: 'Fred' });
user.toJSON({ includeId: true }); // => {id: 4, name: 'Fred', style: 'super'}

// make a user with a trait ('silly') plus these extra attributes provided in the optional hash
let user = make('user', 'silly', { name: 'Fred' });
user.toJSON({ includeId: true }); // => {id: 5, name: 'Fred', style: 'silly'}

// make a user with a hats relationship ( hasMany ) composed of pre-made hats
let hat1 = make('big-hat');
let hat2 = make('big-hat');
let user = make('user', { hats: [hat1, hat2] });
user.toJSON({ includeId: true });
// => {id: 6, name: 'User2', style: 'normal', hats: [{id:1, type:"big_hat"},{id:1, type:"big_hat"}]}
// note that hats are polymorphic. if they weren't, the hats array would be a list of ids: [1,2]

// make a user with a company relationship ( belongsTo ) composed of a pre-made company
let company = make('company');
let user = make('user', { company: company });
user.toJSON({ includeId: true }); // => {id: 7, name: 'User3', style: 'normal', company: 1}

// make user with links to async hasMany properties
let user = make('user', { properties: { links: '/users/1/properties' } });

// make user with links to async belongsTo company
let user = make('user', { company: { links: '/users/1/company' } });

// for model fragments you get an object
let object = make('name'); // => {firstName: 'Boba', lastName: 'Fett'}
```

### `FactoryGuy.makeNew`

- Same api as `FactoryGuy.make`
  - except that the model will be a newly created record with no id

### `FactoryGuy.makeList`

- check out [(user factory):](https://github.com/adopted-ember-addons/ember-data-factory-guy/blob/master/test-app/tests/factories/user.js) to see 'bob' user and 'with_car' trait

Usage:

```javascript
import { make, makeList } from 'ember-data-factory-guy';

// Let's say bob is a named type in the user factory
makeList('user', 'bob'); // makes 0 bob's

makeList('user', 'bob', 2); // makes 2 bob's

makeList('user', 'bob', 2, 'with_car', { name: 'Dude' });
// makes 2 bob users with the 'with_car' trait and name of "Dude"
// In other words, applies the traits and options to every bob made

makeList('user', 'bob', 'with_car', ['with_car', { name: 'Dude' }]);
// makes 2 users with bob attributes. The first also has the 'with_car' trait and the
// second has the 'with_car' trait and name of "Dude", so you get 2 different users
```

### `FactoryGuy.build`

- for building json that you can pass as json payload in [acceptance tests](#acceptance-tests)
- takes the same arguments as `FactoryGuy.make`
- can compose relationships with other `FactoryGuy.build`/`FactoryGuy.buildList` payloads
- can add relationship links to payload
- takes serializer for model into consideration
- to inspect the json use the `get` method
- use the [`add`](#using-add-method) method
  - to include extra sideloaded data to the payload
  - to include meta data
  - REMEMBER, all relationships will be automatically sideloaded,
    so you don't need to add them with the `add()` method

Usage:

```javascript
import { build, buildList } from 'ember-data-factory-guy';

// build a basic user with the default attributes from the user factory
let json = build('user');
json.get(); // => {id: 1, name: 'User1', style: 'normal'}

// build a user with the default attributes plus those defined as 'admin' in the user factory
let json = build('admin');
json.get(); // => {id: 2, name: 'Admin', style: 'super'}

// build a user with the default attributes with extra attributes
let json = build('user', { name: 'Fred' });
json.get(); // => {id: 3, name: 'Fred', style: 'normal'}

// build the admin defined user with extra attributes
let json = build('admin', { name: 'Fred' });
json.get(); // => {id: 4, name: 'Fred', style: 'super'}

// build default user with traits and with extra attributes
let json = build('user', 'silly', { name: 'Fred' });
json.get(); // => {id: 5, name: 'Fred', style: 'silly'}

// build user with hats relationship ( hasMany ) composed of a few pre 'built' hats
let hat1 = build('big-hat');
let hat2 = build('big-hat');
let json = build('user', { hats: [hat1, hat2] });
// note that hats are polymorphic. if they weren't, the hats array would be a list of ids: [1,2]
json.get(); // => {id: 6, name: 'User2', style: 'normal', hats: [{id:1, type:"big_hat"},{id:1, type:"big_hat"}]}

// build user with company relationship ( belongsTo ) composed of a pre 'built' company
let company = build('company');
let json = build('user', { company });
json.get(); // => {id: 7, name: 'User3', style: 'normal', company: 1}

// build and compose relationships to unlimited degree
let company1 = build('company', { name: 'A Corp' });
let company2 = build('company', { name: 'B Corp' });
let owners = buildList('user', { company: company1 }, { company: company2 });
let buildJson = build('property', { owners });

// build user with links to async hasMany properties
let user = build('user', { properties: { links: '/users/1/properties' } });

// build user with links to async belongsTo company
let user = build('user', { company: { links: '/users/1/company' } });
```

- Example of what json payload from build looks like
- Although the RESTAdapter is being used, this works the same with ActiveModel or JSONAPI adapters

```javascript
  let json = build('user', 'with_company', 'with_hats');
  json // =>
    {
      user: {
        id: 1,
        name: 'User1',
        company: 1,
        hats: [
          {type: 'big_hat', id:1},
          {type: 'big_hat', id:2}
        ]
      },
      companies: [
        {id: 1, name: 'Silly corp'}
      ],
      'big-hats': [
        {id: 1, type: "BigHat" },
        {id: 2, type: "BigHat" }
      ]
    }
```

### `FactoryGuy.buildList`

- for building json that you can pass as json payload in [acceptance tests](#acceptance-tests)
- takes the same arguments as `FactoryGuy.makeList`
- can compose relationships with other `build`/`buildList` payloads
- takes serializer for model into consideration
- to inspect the json use the `get()` method
  - can use `get(index)` to get an individual item from the list
- use the [`add`](#using-add-method) method
  - to add extra sideloaded data to the payload => `.add(payload)`
  - to add meta data => `.add({meta})`

Usage:

```javascript
import { build, buildList } from 'ember-data-factory-guy';

let bobs = buildList('bob', 2); // builds 2 Bob's

let bobs = buildList('bob', 2, { name: 'Rob' }); // builds 2 Bob's with name of 'Rob'

// builds 2 users, one with name 'Bob' , the next with name 'Rob'
let users = buildList('user', { name: 'Bob' }, { name: 'Rob' });

// builds 2 users, one with 'boblike' and the next with name 'adminlike' features
// NOTE: you don't say how many to make, because each trait is making new user
let users = buildList('user', 'boblike', 'adminlike');

// builds 2 users:
// one 'boblike' with stoner style
// and the next 'adminlike' with square style
// NOTE: how you are grouping traits and attributes for each one by wrapping them in array
let users = buildList(
  'user',
  ['boblike', { style: 'stoner' }],
  ['adminlike', { style: 'square' }],
);
```

## Additional methods

### Using `add()` method

- when you need to add more json to a payload
  - will be sideloaded
    - only JSONAPI, and REST based serializers can do sideloading
    - so JSONSerializer users can not use this feature
  - you dont need to use json key as in: `build('user').add({json: batMan})`
  - you can just add the payload directly as: `build('user').add(batMan)`

Usage:

```javascript
let batMan = build('bat_man');
let userPayload = build('user').add(batMan);

userPayload = {
  user: {
    id: 1,
    name: 'User1',
    style: 'normal',
  },
  'super-heros': [
    {
      id: 1,
      name: 'BatMan',
      type: 'SuperHero',
    },
  ],
};
```

- when you want to add meta data to payload
  - only JSONAPI, and REST based and serializers can handle meta data
  - so JSONSerializer users can not use this feature ( though this might be a bug on my part )

Usage:

```javascript
  let json1 = buildList('profile', 2).add({ meta: { previous: '/profiles?page=1', next: '/profiles?page=3' } });
  let json2 = buildList('profile', 2).add({ meta: { previous: '/profiles?page=2', next: '/profiles?page=4' } });

  mockQuery('profile', {page: 2}).returns({ json: json1 });
  mockQuery('profile', {page: 3}).returns({ json: json2 });

  store.query('profile', {page: 2}).then((records)=> // first 2 from json1
  store.query('profile', {page: 3}).then((records)=> // second 2 from json2
```

### Using `get()` method

- for inspecting contents of json payload
  - `get()` returns all attributes of top level model
  - `get(attribute)` gives you an attribute from the top level model
  - `get(index)` gives you the info for a hasMany relationship at that index
  - `get(relationships)` gives you just the id or type ( if polymorphic )
    - better to compose the build relationships by hand if you need more info
- check out [user factory:](https://github.com/adopted-ember-addons/ember-data-factory-guy/blob/master/tests/dummy/app/tests/factories/user.js) to see 'boblike' and 'adminlike' user traits

```javascript
let json = build('user');
json.get(); //=> {id: 1, name: 'User1', style: 'normal'}
json.get('id'); // => 1

let json = buildList('user', 2);
json.get(0); //=> {id: 1, name: 'User1', style: 'normal'}
json.get(1); //=> {id: 2, name: 'User2', style: 'normal'}

let json = buildList('user', 'boblike', 'adminlike');
json.get(0); //=> {id: 1, name: 'Bob', style: 'boblike'}
json.get(1); //=> {id: 2, name: 'Admin', style: 'super'}
```

- building relationships inline

```javascript
let json = build('user', 'with_company', 'with_hats');
json.get(); //=> {id: 1, name: 'User1', style: 'normal'}

// to get hats (hasMany relationship) info
json.get('hats'); //=> [{id: 1, type: "big_hat"},{id: 1, type: "big_hat"}]

// to get company ( belongsTo relationship ) info
json.get('company'); //=> {id: 1, type: "company"}
```

- by composing the relationships you can get the full attributes of those associations

```javascript
let company = build('company');
let hats = buildList('big-hats');

let user = build('user', { company, hats });
user.get(); //=> {id: 1, name: 'User1', style: 'normal'}

// to get hats info from hats json
hats.get(0); //=> {id: 1, type: "BigHat", plus .. any other attributes}
hats.get(1); //=> {id: 2, type: "BigHat", plus .. any other attributes}

// to get company info
company.get(); //=> {id: 1, type: "Company", name: "Silly corp"}
```

## Testing setup

- FactoryGuy needs the factories defined before the tests run. This can be done by importing the factories, which register themselves with FactoryGuy.

A clean way to do this is to create a file that imports them all

```js
// tests/factories/factories.js

import 'my-app/tests/factories/address';
import 'my-app/tests/factories/big-group';
import 'my-app/tests/factories/big-hat';
import 'my-app/tests/factories/billing-address';
...
```

And import that file in your test-helper code, before any tests run.

```js
// tests/test-helper.js

import 'my-app/tests/factories';
...
/* existing test-helper.js setup code */
```

- FactoryGuy also needs to run some setup/teardown code before/after each test, use the setupFactoryGuy(hooks) method in your qunit tests to do this.

  - Sample usage: (works the same in any type of test)

  ```js
  import { setupFactoryGuy } from 'ember-data-factory-guy';

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

- And then in your tests you can use your factories (whether thats acceptance, integration or unit tests).

  ```js
  import { setupFactoryGuy } from 'ember-data-factory-guy';

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
