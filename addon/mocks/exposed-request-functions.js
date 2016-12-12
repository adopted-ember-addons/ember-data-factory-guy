import Ember from 'ember';
import Model from 'ember-data/model';
import FactoryGuy from '../factory-guy';
import MockUpdateRequest from './mock-update-request';
import MockCreateRequest from './mock-create-request';
import MockQueryRequest from './mock-query-request';
import MockQueryRecordRequest from './mock-query-record-request';
import MockFindRecordRequest from './mock-find-record-request';
import MockReloadRequest from './mock-reload-request';
import MockFindAllRequest from './mock-find-all-request';
import MockDeleteRequest from './mock-delete-request';

export function mockSetup({ mockjaxLogLevel = 1, responseTime = 0, logLevel = 0 }={}) {
  Ember.$.mockjaxSettings.logging = mockjaxLogLevel; // set to 4 for maximum logging output
  Ember.$.mockjaxSettings.responseTime = responseTime;
  FactoryGuy.settings({ logLevel });
}

export function mockTeardown() {
  Ember.$.mockjax.clear();
}

/**
 Handling ajax GET for handling finding a model
 You can mock failed find by calling `fails()`

 ```js
 // Typically you will use like:

 // To return default factory 'user'
 let mock = mockFindRecord('user');
 let userId = mock.get('id');

 // or to return custom factory built json object
 let json = build('user', 'with_whacky_name', {isDude: true});
 let mock = mockFindRecord('user').returns({json});
 let userId = json.get('id');

 // you could also make the model first and mock that find fails
 let user = make('user')
 let mock = mockFindRecord(user);
 let userId = user.id // or mock.get('id')

 // To mock failure case use method fails
 mockFindRecord('user').fails();

 // Then to 'find' the user
 store.findRecord('user', userId);

 // or in acceptance test
 visit('/user'+userId);
 ```

 @param {String} name  name of the fixture ( or modelName ) to find
 @param {String} trait  optional traits (one or more)
 @param {Object} opts  optional fixture options
 */
export function mockFindRecord(...args) {
  let modelName;

  Ember.assert(`[ember-data-factory-guy] mockFind requires at least a model
     name as first parameter`, args.length > 0);

  if (args[0] instanceof Model) {
    let model = args[0];
    modelName = model.constructor.modelName;
    return new MockFindRecordRequest(modelName).returns({ model });
  }

  modelName = args[0];
  let json = FactoryGuy.build.apply(FactoryGuy, arguments);
  return new MockFindRecordRequest(modelName).returns({ json });
}

export function mockFind() {
  Ember.deprecate("`mockFind` - has been deprecated. Use `mockFindRecord` method instead`",
    false, { id: 'ember-data-factory-guy.mock-find', until: '2.8.0' });
  return mockFindRecord.apply(this, arguments);
}

/**
 Handling ajax GET for reloading a record
 You can mock failed find by calling fails

 ```js
 // Typically you will make a model
 let user = make('user');
 // and then to handle reload, use the mockReload call to mock a reload
 mockReload(user);

 // to mock failure case use method fails
 mockReload(user).fails();
 ```

 @param {String} type  model type like 'user' for User model, or a model instance
 @param {String} id  id of record to find
 */
export function mockReload(...args) {
  let modelName, id;
  if (args[0] instanceof Model) {
    let record = args[0];
    modelName = record.constructor.modelName;
    id = record.id;
  } else if (typeof args[0] === "string" && typeof parseInt(args[1]) === "number") {
    modelName = args[0];
    id = args[1];
  }

  Ember.assert("To handleFind pass in a model instance or a model type name and an id",
    modelName && id);

  let json = FactoryGuy.fixtureBuilder(modelName).convertForBuild(modelName, { id: id });
  return new MockReloadRequest(modelName).returns({ json });
}

/**
 Handling ajax GET for finding all records for a type of model.
 You can mock failed find by passing in success argument as false.

 ```js
 // Pass in the parameters you would normally pass into FactoryGuy.makeList,
 // like fixture name, number of fixtures to make, and optional traits,
 // or fixture options
 let mockFindAll = mockFindAll('user', 2, 'with_hats');

 // or to return custom FactoryGuy built json object
 let json = FactoryGuy.buildList('user', 'with_whacky_name', {isDude: true});
 let mockFindAll = mockFindAll('user').returns({json});

 store.findAll('user').then(function(users){
      // 2 users, first with whacky name, second isDude
   });
 ```

 @param {String} name  name of the fixture ( or model ) to find
 @param {Number} number  number of fixtures to create
 @param {String} trait  optional traits (one or more)
 @param {Object} opts  optional fixture options
 */
export function mockFindAll(...args) {
  let modelName = args[0];

  Ember.assert(`[ember-data-factory-guy] mockFindAll requires at least a model
     name as first parameter`, args.length > 0);

  let mock = new MockFindAllRequest(modelName);

  if (args.length > 1) {
    let json = FactoryGuy.buildList.apply(FactoryGuy, args);
    mock.returns({ json });
  }

  return mock;
}

/**
 Handling ajax GET for finding all records for a type of model with query parameters.


 ```js

 // Create model instances
 let users = FactoryGuy.makeList('user', 2, 'with_hats');

 // Pass in the array of model instances as last argument
 mockQuery('user', {name:'Bob', age: 10}).returns({models: users});

 store.query('user', {name:'Bob', age: 10}}).then(function(userInstances){
     // userInstances will be the same of the users that were passed in
   })
 ```

 By omitting the last argument (pass in no records), this simulates a findQuery
 request that returns no records

 ```js
 // Simulate a query that returns no results
 mockQuery('user', {age: 10000});

 store.query('user', {age: 10000}}).then(function(userInstances){
     // userInstances will be empty
   })
 ```

 @param {String} modelName  name of the mode like 'user' for User model type
 @param {String} queryParams  the parameters that will be queried
 @param {Array}  array of Model records to be 'returned' by query
 */
export function mockQuery(modelName, queryParams={}) {
  Ember.assert('The second argument ( queryParams ) must be an object', Ember.typeOf(queryParams) === 'object');

  return new MockQueryRequest(modelName, queryParams);
}

/**
 Handling ajax GET for finding one record for a type of model with query parameters.


 ```js

 // Create json payload
 let json = FactoryGuy.build('user');

 // Pass in the json in a returns method
 mockQueryRecord('user', {name:'Bob', age: 10}).returns({json});

 store.query('user', {name:'Bob', age: 10}}).then(function(userInstance){
     // userInstance will be created from the json payload
   })
 ```

 ```js

 // Create model instance
 let user = FactoryGuy.make('user');

 // Pass in the array of model instances in the returns method
 mockQueryRecord('user', {name:'Bob', age: 10}).returns({model:user});

 store.query('user', {name:'Bob', age: 10}}).then(function(userInstance){
     // userInstance will be the same of the users that were passed in
   })
 ```

 By not using returns method to return anything, this simulates a
 store.queryRecord request that returns no records

 ```js
 // Simulate a store.queryRecord that returns no results
 mockQueryRecord('user', {age: 10000});

 store.queryRecord('user', {age: 10000}}).then(function(userInstance){
     // userInstance will be empty
   })
 ```

 @param {String} modelName  name of the mode like 'user' for User model type
 @param {String} queryParams  the parameters that will be queried
 @param {Object|Model}  JSON object or Model record to be 'returned' by query
 */
export function mockQueryRecord(modelName, queryParams) {
  if (queryParams) {
    Ember.assert('The second argument ( queryParams ) must be an object', Ember.typeOf(queryParams) === 'object');
  }

  return new MockQueryRecordRequest(modelName, queryParams);
}

/**
 Handling ajax POST ( create record ) for a model.

 ```js
 mockCreate('post')
 mockCreate('post').match({title: 'foo'});
 mockCreate('post').match({title: 'foo', user: user});
 mockCreate('post').returns({createdAt: new Date()});
 mockCreate('post').match({title: 'foo'}).returns({createdAt: new Date()});
 mockCreate('post').match({title: 'foo'}.fails();
 ```

 match - attributes that must be in request json,
 returns - attributes to include in response json,
 fails - can include optional status and response attributes

 ```js
 mockCreate('project').fails({
      status: 422, response: {errors: {name: ['Moo bad, Bahh better']}}
    });
 ```

 Note:
 1) Any attributes in match will be added to the response json automatically,
 so you don't need to include them in the returns hash.

 2) As long as all the match attributes are found in the record being created,
 the create will succeed. In other words, there may be other attributes in the
 createRecord call, but you don't have to match them all. For example:

 ```js
 mockCreate('post').match({title: 'foo'});
 store.createRecord('post', {title: 'foo', created_at: new Date()})
 ```

 2) If you match on a belongsTo association, you don't have to include that in the
 returns hash either.

 @param {String} modelName  name of model you're creating like 'profile' for Profile
 */
export function mockCreate(modelName) {
  Ember.assert(`[ember-data-factory-guy] mockCreate requires at least a model type name`, modelName);
  
  return new MockCreateRequest(modelName);
}

/**
 Handling ajax PUT ( update record ) for a model type. You can mock
 failed update by calling 'fails' method after setting up the mock

 ```js
 // Typically you will make a model
 let user = make('user');
 // and then to handle update, use the mockUpdate call to mock a update
 mockUpdate(user);
 or
 // mockUpdate('user', user.id);
 or
 // just the model type
 // mockUpdate('user');

 // and to mock failure case use method fails
 mockUpdate(user).fails();
 ```

 @param {String} type  model type like 'user' for User model, or a model instance
 @param {String} id  id of record to update
 @param {Object} options options object
 */
export function mockUpdate(...args) {
  let model, modelName, id;

  if (args[0] instanceof Model) {
    model = args[0];
    id = model.id;
    modelName = model.constructor.modelName;
  } else {
    if (typeof args[0] === "string") {
      [modelName, id] = args;
    }
  }

  Ember.assert("To mockUpdate pass in a model instance or a modelName and an id or just a modelName", modelName);

  return new MockUpdateRequest(modelName, id);
}

/**
 Handling ajax DELETE ( delete record ) for a model type. You can mock
 failed delete by calling 'fails' method after setting up the mock

 @param {String|Model} type|model model type like 'user' for User model or Model record
 @param {String} id optional id of record to delete
 */
export function mockDelete(...args) {
  let modelName, id;

  if (args[0] instanceof Model) {
    let record = args[0];
    modelName = record.constructor.modelName;
    id = record.id;
  } else if (typeof args[0] === "string" && typeof parseInt(args[1]) === "number") {
    modelName = args[0];
    id = args[1];
  }

  Ember.assert(`[ember-data-factory-guy] mockDelete requires at least a model type name`, modelName);

  return new MockDeleteRequest(modelName, id);
}
