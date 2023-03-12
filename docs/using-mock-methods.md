# Using mock methods

- Uses pretender
  - for mocking the ajax calls made by ember-data
  - pretender library is installed with FactoryGuy
- http GET mocks
  - [mockFindRecord](#mockfindrecord)
  - [mockFindAll](#mockfindall)
  - [mockReload](#mockreload)
  - [mockQuery](#mockquery)
  - [mockQueryRecord](#mockqueryrecord)
  - takes modifier method `returns()` for setting the payload response
    - `returns()` accepts parameters like: json, model, models, id, ids, headers
      - headers are cumulative so you can add as many as you like
      - Example:
      ```javascript
        let mock = mockFindAll('user').returns({headers: {'X-Man': "Wolverine"});
        mock.returns({headers: {'X-Weapon': "Claws"}});
      ```
  - these mocks are are reusable
    - so you can simulate making the same ajax call ( url ) and return a different payload
- http POST/PUT/DELETE
  - [mockCreate](#mockcreate)
  - [mockUpdate](#mockupdate)
  - [mockDelete](#mockdelete)
- Custom mocks (http GET/POST/PUT/DELETE)

  - [mock](#mock)

- Use method `fails()` to simulate failure
- Use method `succeeds()` to simulate success

  - Only used if the mock was set to fail with `fails()` and you want to set the
    mock to succeed to simulate a successful retry

- Use property `timesCalled` to verify how many times the ajax call was mocked

  - works when you are using `mockQuery`, `mockQueryRecord`, `mockFindAll`, `mockReload`, or `mockUpdate`
  - `mockFindRecord` will always be at most 1 since it will only make ajax call
    the first time, and then the store will use cache the second time
  - Example:

  ```javascript
  const mock = mockQueryRecord('company', {}).returns({
    json: build('company'),
  });

  FactoryGuy.store.queryRecord('company', {}).then(() => {
    FactoryGuy.store.queryRecord('company', {}).then(() => {
      mock.timesCalled; //=> 2
    });
  });
  ```

- Use method `disable()` to temporarily disable the mock. You can re-enable
  the disabled mock using `enable()`.

- Use method `destroy()` to completely remove the mock handler for the mock.
  The `isDestroyed` property is set to `true` when the mock is destroyed.

##### setup

- As of v2.13.15 mockSetup and mockTeardown are no longer needed
- Use FactoryGuy.settings to set:
  - logLevel ( 0 - off , 1 - on ) for seeing the FactoryGuy responses
  - responseTime ( in millis ) for simulating slower responses
  - Example:
  ```javascript
  FactoryGuy.settings({ logLevel: 1, responseTime: 1000 });
  ```

##### Using fails method

- Usable on all mocks
- Use optional object arguments status and response and convertErrors to customize

  - status : must be number in the range of 3XX, 4XX, or 5XX ( default is 500 )
  - response : must be object with errors key ( default is null )
  - convertErrors : set to false and object will be left untouched ( default is true )
    - errors must be in particular format for ember-data to accept them
      - FactoryGuy allows you to use a simple style: `{errors: {name: "Name too short"}}`
      - Behind the scenes converts to another format for ember-data to consume

- Examples:

```javascript
let errors401 = { errors: { description: 'Unauthorized' } };
let mock = mockFindAll('user').fails({ status: 401, response: errors401 });

let errors422 = { errors: { name: 'Name too short' } };
let mock = mockFindRecord('profile').fails({
  status: 422,
  response: errors422,
});

let errorsMine = {
  errors: [{ detail: 'Name too short', title: 'I am short' }],
};
let mock = mockFindRecord('profile').fails({
  status: 422,
  response: errorsMine,
  convertErrors: false,
});
```

## `mockFindRecord`

- For dealing with finding one record of a model type => `store.findRecord('modelType', id)`
- Can pass in arguments just like you would for [`make`](#factoryguymake) or [`build`](#factoryguybuild)
  - `mockFindRecord`( fixture or model name, optional traits, optional attributes object)
- Takes modifier method `returns()` for controlling the response payload
  - returns( model / json / id )
- Takes modifier method `adapterOptions()` for setting adapterOptions ( get passed to urlForFindRecord )
- Sample acceptance tests using `mockFindRecord`: [user-view-test.js:](https://github.com/adopted-ember-addons/ember-data-factory-guy/blob/master/tests/acceptance/user-view-test.js)

Usage:

```javascript
import { build, make, mockFindRecord } from 'ember-data-factory-guy';
```

- To return default factory model type ( 'user' in this case )

```javascript
// mockFindRecord automatically returns json for the modelType ( in this case 'user' )
let mock = mockFindRecord('user');
let userId = mock.get('id');
```

- Using `returns({json})` to return json object

```javascript
let user = build('user', 'whacky', { isDude: true });
let mock = mockFindRecord('user').returns({ json: user });
// user.get('id') => 1
// user.get('style') => 'whacky'

// or to acccomplish the same thing with less code
let mock = mockFindRecord('user', 'whacky', { isDude: true });
// mock.get('id') => 1
// mock.get('style') => 'whacky'
let user = mock.get();
// user.id => 1
// user.style => 'whacky'
```

- Using `returns({model})` to return model instance

```javascript
let user = make('user', 'whacky', { isDude: false });
let mock = mockFindRecord('user').returns({ model: user });
// user.get('id') => 1
// you can now also user.get('any-computed-property')
// since you have a real model instance
```

- Simper way to return a model instance

```javascript
let user = make('user', 'whacky', { isDude: false });
let mock = mockFindRecord(user);
// user.get('id') === mock.get('id')
// basically a shortcut to the above .returns({ model: user })
// as this sets up the returns for you
```

- To reuse the mock

```javascript
let user2 = build('user', { style: 'boring' });
mock.returns({ json: user2 });
// mock.get('id') => 2
```

- To mock failure case use `fails` method

```javascript
mockFindRecord('user').fails();
```

- To mock failure when you have a model already

```javascript
let profile = make('profile');
mockFindRecord(profile).fails();
// mock.get('id') === profile.id
```

- To use adapterOptions

```javascript
  let mock = mockFindRecord('user').adapterOptions({friendly: true});
  // used when urlForFindRecord (defined in adapter) uses them
  urlForFindRecord(id, modelName, snapshot) {
    if (snapshot && snapshot.adapterOptions) {
       let { adapterOptions }  = snapshot; // => {friendly: true}
       // ... blah blah blah
    }
    // ... blah blah
  }
```

## `mockFindAll`

- For dealing with finding all records for a model type => `store.findAll(modelType)`
- Takes same parameters as [makeList](#factoryguymakelist)
  - `mockFindAll`( fixture or model name, optional number, optional traits, optional attributes object)
- Takes modifier method `returns()` for controlling the response payload
  - returns( models / json / ids )
- Takes modifier method `adapterOptions()` for setting adapterOptions ( get passed to urlForFindAll )
  - used just as in mockFindRecord ( see example there )
- Sample acceptance tests using `mockFindAll`: [users-view-test.js](https://github.com/adopted-ember-addons/ember-data-factory-guy/blob/master/tests/acceptance/users-view-test.js)

Usage:

```javascript
import { buildList, makeList, mockFindAll } from 'ember-data-factory-guy';
```

- To mock and return no results

```javascript
let mock = mockFindAll('user');
```

- Using `returns({json})` to return json object

```javascript
// that has 2 different users:
let users = buildList('user', 'whacky', 'silly');
let mock = mockFindAll('user').returns({ json: users });
let user1 = users.get(0);
let user2 = users.get(1);
// user1.style => 'whacky'
// user2.style => 'silly'

// or to acccomplish the same thing with less code
let mock = mockFindAll('user', 'whacky', 'silly');
let user1 = mock.get(0);
let user2 = mock.get(1);
// user1.style => 'whacky'
// user2.style => 'silly'
```

- Using `returns({models})` to return model instances

```javascript
let users = makeList('user', 'whacky', 'silly');
let mock = mockFindAll('user').returns({ models: users });
let user1 = users[0];
// you can now also user1.get('any-computed-property')
// since you have a real model instance
```

- To reuse the mock and return different payload

```javascript
let users2 = buildList('user', 3);
mock.returns({ json: user2 });
```

- To mock failure case use `fails()` method

```javascript
mockFindAll('user').fails();
```

## `mockReload`

- To handle reloading a model
  - Pass in a record ( or a typeName and id )

Usage:

- Passing in a record / model instance

```javascript
let profile = make('profile');
mockReload(profile);

// will stub a call to reload that profile
profile.reload();
```

- Using `returns({attrs})` to return new attributes

```javascript
let profile = make('profile', { description: 'whatever' });
mockReload(profile).returns({ attrs: { description: 'moo' } });
profile.reload(); // description is now "moo"
```

- Using `returns({json})` to return all new attributes

```javascript
  let profile = make('profile', { description: "tomatoes" });
  // all new values EXCEPT the profile id ( you should keep that id the same )
  let profileAllNew = build('profile', { id: profile.get('id'), description: "potatoes" }
  mockReload(profile).returns({ json: profileAllNew });
  profile.reload(); // description = "potatoes"
```

- Mocking a failed reload

```javascript
mockReload('profile', 1).fails();
```

## `mockQuery`

- For dealing with querying for all records for a model type => `store.query(modelType, params)`
  - Takes modifier method `returns()` for controlling the response payload
    - returns( models / json / ids )
- Takes modifier methods for matching the query params
- `withParams( object )`
- `withSomeParams( object )`
- Sample acceptance tests using `mockQuery`: [user-search-test.js](https://github.com/adopted-ember-addons/ember-data-factory-guy/blob/master/tests/acceptance/user-search-test.js)

Usage:

```javascript
  import FactoryGuy, { make, build, buildList, mockQuery } from 'ember-data-factory-guy';
  let store = FactoryGuy.store;

  // This simulates a query that returns no results
  mockQuery('user', {age: 10});

  store.query('user', {age: 10}}).then((userInstances) => {
    /// userInstances will be empty
  })
```

- with returns( models )

```javascript
  // Create model instances
  let users = makeList('user', 2, 'with_hats');

  mockQuery('user', {name:'Bob', age: 10}).returns({models: users});

  store.query('user', {name:'Bob', age: 10}}).then((models)=> {
    // models are the same as the users array
  });
```

- with returns ( json )

```js
  // Create json with buildList
  let users = buildList('user', 2, 'with_hats');

  mockQuery('user', {name:'Bob', age: 10}).returns({json: users});

  store.query('user', {name:'Bob', age: 10}}).then((models)=> {
    // these models were created from the users json
  });
```

- with returns( ids )

```javascript
  // Create list of models
  let users = buildList('user', 2, 'with_hats');
  let user1 = users.get(0);

  mockQuery('user', {name:'Bob', age: 10}).returns({ids: [user1.id]});

  store.query('user', {name:'Bob', age: 10}}).then(function(models) {
    // models will be one model and it will be user1
  });

```

- withParams() / withSomeParams()

```javascript
  // Create list of models
  let users = buildList('user', 2, 'with_hats');
  let user1 = users.get(0);

  mock = mockQuery('user').returns({ids: [user1.id]});

  mock.withParams({name:'Bob', age: 10})

  // When using 'withParams' modifier, params hash must match exactly
  store.query('user', {name:'Bob', age: 10}}).then(function(models) {
    // models will be one model and it will be user1
  });

  // The following call will not be caught by the mock
  store.query('user', {name:'Bob', age: 10, hair: 'brown'}})

  // 'withSomeParams' is designed to catch requests by partial match
  // It has precedence over strict params matching once applied
  mock.withSomeParams({name:'Bob'})

  // Now both requests will be intercepted
  store.query('user', {name:'Bob', age: 10}})
  store.query('user', {name:'Bob', age: 10, hair: 'brown'}})
```

## `mockQueryRecord`

- For dealing with querying for one record for a model type => `store.queryRecord(modelType, params)`
  - takes modifier method `returns()` for controlling the response payload
    - returns( model / json / id )
- takes modifier methods for matching the query params
- withParams( object )

Usage:

```javascript
  import FactoryGuy, { make, build, mockQueryRecord } from 'ember-data-factory-guy';
  let store = FactoryGuy.store;

  // This simulates a query that returns no results
  mockQueryRecord('user', {age: 10});

  store.queryRecord('user', {age: 10}}).then((userInstance) => {
    /// userInstance will be empty
  })
```

- with returns( models )

```javascript
  // Create model instances
  let user = make('user');

  mockQueryRecord('user', {name:'Bob', age: 10}).returns({model: user});

  store.queryRecord('user', {name:'Bob', age: 10}}).then((model)=> {
    // model is the same as the user you made
  });
```

- with returns( json )

```js
  // Create json with buildList
  let user = build('user');

  mockQueryRecord('user', {name:'Bob', age: 10}).returns({json: user});

  store.queryRecord('user', {name:'Bob', age: 10}}).then((model)=> {
    // user model created from the user json
  });
```

- with returns( ids )

```javascript
  // Create list of models
  let user = build('user', 'with_hats');

  mockQueryRecord('user', {name:'Bob', age: 10}).returns({id: user.get('id')});

  store.queryRecord('user', {name:'Bob', age: 10}}).then(function(model) {
    // model will be one model and it will be user1
  });

```

## `mockCreate`

- Use chainable methods to build the response
  - match: takes a hash with attributes or a matching function
    1. attributes that must be in request json
    - These will be added to the response json automatically, so
      you don't need to include them in the returns hash.
    - If you match on a `belongsTo` association, you don't have to include that in
      the returns hash either ( same idea )
    1. a function that can be used to perform an arbitrary match against the request
       json, returning `true` if there is a match, `false` otherwise.
  - returns
    - attributes ( including relationships ) to include in response json
- Need to import `run` from `@ember/runloop` and wrap tests using `mockCreate` with: `run(function() { 'your test' })`

Realistically, you will have code in a view action or controller action that will
create the record, and setup any associations.

```javascript

  // most actions that create a record look something like this:
  action: {
    addProject: function (user) {
      let name = this.$('button.project-name').val();
      this.store.createRecord('project', {name: name, user: user}).save();
    }
  }

```

In this case, you are are creating a 'project' record with a specific name, and belonging
to a particular user. To mock this `createRecord` call here are a few ways to do this using
chainable methods.

Usage:

```javascript
import { makeNew, mockCreate } from 'ember-data-factory-guy';

// Simplest case
// Don't care about a match just handle createRecord for any project
mockCreate('project');

// use a model you created already from store.createRecord or makeNew
// need to use this style if you need the model in the urlForCreateRecord snapshot
let project = makeNew('project');
mockCreate(project);

// Matching some attributes
mockCreate('project').match({ name: 'Moo' });

// Match all attributes
mockCreate('project').match({ name: 'Moo', user: user });

// Match using a function that checks that the request's top level attribute "name" equals 'Moo'
mockCreate('project').match((requestData) => requestData.name === 'Moo');

// Exactly matching attributes, and returning extra attributes
mockCreate('project')
  .match({ name: 'Moo', user: user })
  .returns({ created_at: new Date() });

// Returning belongsTo relationship. Assume outfit belongsTo 'person'
let person = build('super-hero'); // it's polymorphic
mockCreate('outfit').returns({ attrs: { person } });

// Returning hasMany relationship. Assume super-hero hasMany 'outfits'
let outfits = buildList('outfit', 2);
mockCreate('super-hero').returns({ attrs: { outfits } });
```

- mocking a failed create

```javascript
// Mocking failure case is easy with chainable methods, just use #fails
mockCreate('project').match({ name: 'Moo' }).fails();

// Can optionally add a status code and/or errors to the response
mockCreate('project').fails({
  status: 422,
  response: { errors: { name: ['Moo bad, Bahh better'] } },
});

store.createRecord('project', { name: 'Moo' }).save(); //=> fails
```

## `mockUpdate`

- `mockUpdate(model)`
  - Single argument ( the model instance that will be updated )
- `mockUpdate(modelType, id)`
  - Two arguments: modelType ( like 'profile' ) , and the profile id that will updated
- Use chainable methods to help build response:
  - `match`: takes a hash with attributes or a matching function
    1. attributes with values that must be present on the model you are updating
    1. a function that can be used to perform an arbitrary match against the request
       json, returning `true` if there is a match, `false` otherwise.
  - returns
    - attributes ( including relationships ) to include in response json
- Need to import `run` from `@ember/runloop` and wrap tests using `mockUpdate` with: `run(function() { 'your test' })`

Usage:

```javascript
import { make, mockUpdate } from 'ember-data-factory-guy';

let profile = make('profile');

// Pass in the model that will be updated ( if you have it available )
mockUpdate(profile);

// If the model is not available, pass in the modelType and the id of
// the model that will be updated
mockUpdate('profile', 1);

profile.set('description', 'good value');
profile.save(); //=> will succeed

// Returning belongsTo relationship. Assume outfit belongsTo 'person'
let outfit = make('outfit');
let person = build('super-hero'); // it's polymorphic
outfit.set('name', 'outrageous');
mockUpdate(outfit).returns({ attrs: { person } });
outfit.save(); //=> saves and returns superhero

// Returning hasMany relationship. Assume super-hero hasMany 'outfits'
let superHero = make('super-hero');
let outfits = buildList('outfit', 2, { name: 'bell bottoms' });
superHero.set('style', 'laid back');
mockUpdate(superHero).returns({ attrs: { outfits } });
superHero.save(); // => saves and returns outfits

// using match() method to specify attribute values
let profile = make('profile');
profile.set('name', 'woo');
let mock = mockUpdate(profile).match({ name: 'moo' });
profile.save(); // will not be mocked since the mock you set says the name must be "woo"

// using match() method to specify a matching function
let profile = make('profile');
profile.set('name', 'woo');
let mock = mockUpdate(profile).match((requestBody) => {
  // this example uses a JSONAPI Adapter
  return requestBody.data.attributes.name === 'moo';
});
profile.save(); // will not be mocked since the mock you set requires the request's top level attribute "name" to equal "moo"

// either set the name to "moo" which will now be mocked correctly
profile.set('name', 'moo');
profile.save(); // succeeds

// or

// keep the profile name as "woo"
// but change the mock to match the name "woo"
mock.match({ name: 'woo' });
profile.save(); // succeeds
```

- mocking a failed update

```javascript
let profile = make('profile');

// set the succeed flag to 'false'
mockUpdate('profile', profile.id).fails({
  status: 422,
  response: 'Invalid data',
});
// or
mockUpdate(profile).fails({ status: 422, response: 'Invalid data' });

profile.set('description', 'bad value');
profile.save(); //=> will fail
```

_mocking a failed update and retry with success_

```javascript
let profile = make('profile');

let mockUpdate = mockUpdate(profile);

mockUpdate.fails({ status: 422, response: 'Invalid data' });

profile.set('description', 'bad value');
profile.save(); //=> will fail

// After setting valid value
profile.set('description', 'good value');

// Now expecting success
mockUpdate.succeeds();

// Try that update again
profile.save(); //=> will succeed!
```

## `mockDelete`

- Need to import `run` from `@ember/runloop` and wrap tests using `mockDelete` with: `run(function() { 'your test' })`
- To handle deleting a model
  - Pass in a record ( or a typeName and id )

Usage:

- Passing in a record / model instance

```javascript
import { make, mockDelete } from 'ember-data-factory-guy';

let profile = make('profile');
mockDelete(profile);

profile.destroyRecord(); // => will succeed
```

- Passing in a model typeName and id

```javascript
import { make, mockDelete } from 'ember-data-factory-guy';

let profile = make('profile');
mockDelete('profile', profile.id);

profile.destroyRecord(); // => will succeed
```

- Passing in a model typeName

```javascript
import { make, mockDelete } from 'ember-data-factory-guy';

let profile1 = make('profile');
let profile2 = make('profile');
mockDelete('profile');

profile1.destroyRecord(); // => will succeed
profile2.destroyRecord(); // => will succeed
```

- Mocking a failed delete

```javascript
mockDelete(profile).fails();
```

## `mock`

Well, you have read about all the other `mock*` methods, but what if you have
endpoints that do not use Ember Data? Well, `mock` is for you.

- mock({type, url, responseText, status})
  - type: The HTTP verb (`GET`, `POST`, etc.) Defaults to `GET`
  - url: The endpoint URL you are trying to mock
  - responseText: This can be whatever you want to return, even a JavaScript object
  - status: The status code of the response. Defaults to `200`

Usage:

- Simple case

```javascript
import { mock } from 'ember-data-factory-guy';

this.mock({ url: '/users' });
```

- Returning a JavaScript object

```javascript
import { mock } from 'ember-data-factory-guy';

this.mock({
  type: 'POST',
  url: '/users/sign_in',
  responseText: { token: '0123456789-ab' },
});
```

## Using Pretender

The addon uses [Pretender](https://github.com/pretenderjs/pretender) to mock the requests. It exposes the functions `getPretender` and `setPretender` to respectively get the Pretender server for the current test or set it. For instance, you can use pretender's [passthrough](https://github.com/pretenderjs/pretender#pass-through) feature to ignore data URLs:

```javascript
import { getPretender } from 'ember-data-factory-guy';

// Passthrough 'data:' requests.
getPretender().get('data:*', getPretender().passthrough);
```
