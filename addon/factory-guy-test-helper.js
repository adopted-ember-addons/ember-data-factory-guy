import Ember from 'ember';
import DS from 'ember-data';
import $ from 'jquery';
import FactoryGuy from './factory-guy';
import MockUpdateRequest from './mock-update-request';
import MockCreateRequest from './mock-create-request';
import MockGetRequest from './mock-get-request';

var FactoryGuyTestHelper = Ember.Object.create({

  setup: function () {
    $.mockjaxSettings.logging = false;
    $.mockjaxSettings.responseTime = 0;
  },
  // Look up a controller from the current container
  controllerFor: function (name) {
    return this.get('container').lookup('controller:' + name);
  },
  // Set a property on a controller in the current container
  setControllerProp: function (controller_name, property, value) {
    var controller = this.controllerFor(controller_name);
    controller.set(property, value);
  },
  getStore: function () {
    return this.get('container').lookup('service:store');
  },
  /**
   Using mockjax to stub an http request.

   @param {String} url request url
   @param {Object} json response
   @param {Object} options ajax request options
   */
  stubEndpointForHttpRequest: function (url, json, options) {
    options = options || {};
    var request = {
      url: url,
      dataType: 'json',
      responseText: json,
      type: options.type || 'GET',
      status: options.status || 200
    };
    if (options.urlParams) {
      request.urlParams = options.urlParams;
    }
    if (options.data) {
      request.data = options.data;
    }

    $.mockjax(request);
  },
  /**
   Build url for the mockjax call. Proxy to the adapters buildURL method.

   @param {String} typeName model type name like 'user' for User model
   @param {String} id
   @return {String} url
   */
  buildURL: function (modelName, id) {
    var adapter = this.getStore().adapterFor(modelName);
    return adapter.buildURL(modelName, id);
  },
  /**
   Map many json objects to response json.

   Allows custom serializing mappings and meta data to be added to requests.

   @param {String} modelName model name
   @param {Object} json Json objects from records.map
   @return {Object} responseJson
   */
  mapFindAll: function (modelName, json) {
    var modelKey = Ember.String.pluralize(modelName);
    return {[modelKey]: json};
  },
  /**
   Map single object to response json.

   Allows custom serializing mappings and meta data to be added to requests.

   @param {String} modelName model name
   @param {Object} json Json object from record.toJSON
   @return {Object} responseJson
   */
  mapFind: function (modelName, json) {
    return {[modelName]: json};
  },
  /**
   Handling ajax GET for handling finding a model
   You can mock failed find by calling andFail

   ```js
   // Typically you will use like:

   // To mock success
   var userId = TestHelper.handleFind('user');

   // To mock failure case use method andFail
   var userId = TestHelper.handleFind('user').andFail();

   // Then to 'find' the user
   store.find('user', userId);

   // or in acceptance test
   visit('/user'+userId);
   ```

   @param {String} name  name of the fixture ( or modelName ) to find
   @param {String} trait  optional traits (one or more)
   @param {Object} opts  optional fixture options
   */
  handleFind: function () {
    var args = Array.prototype.slice.call(arguments);
    var modelName = args.shift();
    var json = FactoryGuy.build.apply(FactoryGuy, arguments);
    var id;

    if (FactoryGuy.useJSONAPI()) {
      id = json.data.id;
    } else {
      id = json[modelName].id;
    }

    var url = this.buildURL(modelName, id);
    new MockGetRequest(url, modelName, json);
    return id;
  },
  /**
   Handling ajax GET for handling reloading a record
   You can mock failed find by calling andFail

   ```js
   // Typically you will make a model
   var user = make('user');
   // and then to handle reload, use the testHelper.handleFind call to mock a reload
   testHelper.handleReload(user);

   // to mock failure case use method andFail
   testHelper.handleReload(user).andFail();
   ```

   @param {String} type  model type like 'user' for User model, or a model instance
   @param {String} id  id of record to find
   */
  handleReload: function () {
    var args = Array.prototype.slice.call(arguments);

    var modelName, id;
    if (args[0] instanceof DS.Model) {
      var record = args[0];
      modelName = record.constructor.modelName;
      id = record.id;
    } else if (typeof args[0] === "string" && typeof parseInt(args[1]) === "number") {
      modelName = args[0];
      id = args[1];
    }

    Ember.assert("To handleFind pass in a model instance or a model type name and an id", modelName && id);

    var url = this.buildURL(modelName, id);
    var json = FactoryGuy.getFixtureBuilder().convertForBuild(modelName, {id: id});

    return new MockGetRequest(url, modelName, json);
  },
  /**
   Handling ajax GET for finding all records for a type of model.
   You can mock failed find by passing in success argument as false.

   ```js
   // Pass in the parameters you would normally pass into FactoryGuy.makeList,
   // like fixture name, number of fixtures to make, and optional traits,
   // or fixture options
   testHelper.handleFindAll('user', 2, 'with_hats');

   store.findAll('user').then(function(users){

   });
   ```

   @param {String} name  name of the fixture ( or model ) to find
   @param {Number} number  number of fixtures to create
   @param {String} trait  optional traits (one or more)
   @param {Object} opts  optional fixture options
   */
  handleFindAll: function () {
    var args = Array.prototype.slice.call(arguments);
    var modelName = args.shift();
    var json = FactoryGuy.buildList.apply(FactoryGuy, arguments);

    var url = this.buildURL(modelName);
    this.stubEndpointForHttpRequest(url, json);
  },
  /**
   Handling ajax GET for finding all records for a type of model with query parameters.


   ```js

   // Create model instances
   var users = FactoryGuy.makeList('user', 2, 'with_hats');

   // Pass in the array of model instances as last argument
   testHelper.handleQuery('user', {name:'Bob', age: 10}, users);

   store.query('user', {name:'Bob', age: 10}}).then(function(userInstances){
     // userInstances will be the same of the users that were passed in
   })
   ```

   By omitting the last argument (pass in no records), this simulates a findQuery
   request that returns no records

   ```js
   // Simulate a query that returns no results
   testHelper.handleQuery('user', {age: 10000});

   store.query('user', {age: 10000}}).then(function(userInstances){
     // userInstances will be empty
   })
   ```

   @param {String} modelName  name of the mode like 'user' for User model type
   @param {String} searchParams  the parameters that will be queried
   @param {Array}  array of DS.Model records to be 'returned' by query
   */
  handleQuery: function (modelName, searchParams, records) {
    Ember.assert('The second argument of searchParams must be an object', Ember.typeOf(searchParams) === 'object');
    if (records) {
      Ember.assert('The third argument ( records ) must be an array - found type:' + Ember.typeOf(records), Ember.typeOf(records) === 'array');
    } else {
      records = [];
    }

    var json = records.map(function (record) {
      return record.serialize({includeId: true});
    });

    var responseJson;
    if (FactoryGuy.useJSONAPI()) {
      json = json.map(function (data) {
        return data.data;
      });
      responseJson = {data: json};
    } else {
      responseJson = this.mapFindAll(modelName, json);
    }

    var url = this.buildURL(modelName);
    this.stubEndpointForHttpRequest(url, responseJson, {data: searchParams});
  },
  handleFindQuery: function (modelName, searchParams, records) {
    Ember.deprecate("handleFindQuery is deprecated and will be removed in later versions, please use handleQuery");
    return this.handleQuery(modelName, searchParams, records);
  },
  /**
   Handling ajax POST ( create record ) for a model.

   ```js
   handleCreate('post')
   handleCreate('post').match({title: 'foo'});
   handleCreate('post').match({title: 'foo', user: user});
   handleCreate('post').andReturn({createdAt: new Date()});
   handleCreate('post').match({title: 'foo'}).andReturn({createdAt: new Date()});
   handleCreate('post').match({title: 'foo'}.andFail();
   ```

   match - attributes that must be in request json,
   andReturn - attributes to include in response json,
   andFail - can include optional status and response attributes

   ```js
   TestHelper.handleCreate('project').andFail({
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
   handleCreate('post').match({title: 'foo'});
   store.createRecord('post', {title: 'foo', created_at: new Date()})
   ```

   2) If you match on a belongsTo association, you don't have to include that in the
   returns hash either.

   @param {String} modelName  name of model your creating like 'profile' for Profile
   @param {Object} options  hash of options for handling request
   */
  handleCreate: function (modelName, options) {
    var url = this.buildURL(modelName);
    var opts = options === undefined ? {} : options;
    return new MockCreateRequest(url, modelName, opts);
  },

  /**
   Handling ajax PUT ( update record ) for a model type. You can mock
   failed update by calling 'andFail' method after setting up the mock

   ```js
   // Typically you will make a model
   var user = make('user');
   // and then to handle update, use the testHelper.handleUpdate call to mock a update
   testHelper.handleUpdate(user);
   or
   // testHelper.handleUpdate('user', user.id);

   // and to mock failure case use method andFail
   testHelper.handleFind(user).andFail();
   ```

   @param {String} type  model type like 'user' for User model, or a model instance
   @param {String} id  id of record to update
   @param {Object} options options object
   */
  handleUpdate: function () {
    var args = Array.prototype.slice.call(arguments);
    Ember.assert("To handleUpdate pass in a model instance or a type and an id", args.length > 0);

    var options = {};
    if (args.length > 1 && typeof args[args.length - 1] === 'object') {
      options = args.pop();
    }

    var model, type, id;
    var store = this.getStore();

    if (args[0] instanceof DS.Model) {
      model = args[0];
      id = model.id;
      type = model.constructor.modelName;
    } else if (typeof args[0] === "string" && typeof parseInt(args[1]) === "number") {
      type = args[0];
      id = args[1];
      model = store.peekRecord(type, id);
    }
    Ember.assert("To handleUpdate pass in a model instance or a model type name and an id", type && id);

    var url = this.buildURL(type, id);
    return new MockUpdateRequest(url, model, this.mapFind, options);
  },
  /**
   Handling ajax DELETE ( delete record ) for a model type. You can mock
   failed delete by passing in success argument as false.

   @param {String} type  model type like 'user' for User model
   @param {String} id  id of record to update
   @param {Boolean} succeed  optional flag to indicate if the request
   should succeed ( default is true )
   */
  handleDelete: function (type, id, succeed) {
    succeed = succeed === undefined ? true : succeed;
    this.stubEndpointForHttpRequest(this.buildURL(type, id), null, {
      type: 'DELETE',
      status: succeed ? 200 : 500
    });
  },

  teardown: function () {
    $.mockjax.clear();
  }
});

export default FactoryGuyTestHelper;
