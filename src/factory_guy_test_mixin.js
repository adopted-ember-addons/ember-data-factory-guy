var FactoryGuyTestMixin = Em.Mixin.create({
  // Pass in the app root, which typically is App.
  setup: function (app) {
    this.set('container', app.__container__);
    FactoryGuy.setStore(this.getStore());
    return this;
  },
  useFixtureAdapter: function (app) {
    app.ApplicationAdapter = DS.FixtureAdapter;
    this.getStore().adapterFor('application').simulateRemoteResponse = false;
  },
  /**
   @param {String} model type like user for model User
   @return {boolean} true if model's serializer is ActiveModelSerializer based
   */
  usingActiveModelSerializer: function (type) {
    var store = this.getStore();
    var modelType = store.modelFor(type);
    var serializer = store.serializerFor(modelType.typeKey);
    return serializer instanceof DS.ActiveModelSerializer;
  },
  /**
   Proxy to store's find method

   @param {String or subclass of DS.Model} type
   @param {Object|String|Integer|null} id
   @return {Promise} promise
   */
  find: function (type, id) {
    return this.getStore().find(type, id);
  },
  /**
   Make new fixture and save to store. Proxy to FactoryGuy#make method
   */
  make: function () {
    return FactoryGuy.make.apply(FactoryGuy, arguments);
  },
  getStore: function () {
    return this.get('container').lookup('store:main');
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
  buildURL: function (typeName, id) {
    var type = this.getStore().modelFor(typeName);
    return this.getStore().adapterFor(type).buildURL(type.typeKey, id);
  },
  /**
     Handling ajax GET for finding all records for a type of model.
     You can mock failed find by passing in success argument as false.

   ```js
     // Pass in the parameters you would normally pass into FactoryGuy.makeList,
     // like fixture name, number of fixtures to make, and optional traits,
     // or fixture options
     testHelper.handleFindAll('user', 2, 'with_hats');

     store.find('user').then(function(users){

     });
   ```

     @param {String} name  name of the fixture ( or model ) to find
     @param {Number} number  number of fixtures to create
     @param {String} trait  optional traits (one or more)
     @param {Object} opts  optional fixture options
   */
  handleFindAll: function () {
    // make the records and load them in the store
    var records = FactoryGuy.makeList.apply(FactoryGuy, arguments);
    var name = arguments[0];
    var modelName = FactoryGuy.lookupModelForFixtureName(name);
    var responseJson = {};
    var json = records.map(function(record) {return record.toJSON({includeId: true})});
    responseJson[modelName.pluralize()] = json;
    var url = this.buildURL(modelName);
    this.stubEndpointForHttpRequest(url, responseJson);
  },
  handleFindMany: function() {
    Ember.deprecate('DEPRECATION Warning: use handleFindAll instead');
    this.handleFindAll.apply(this, arguments)
  },
  /**
     Handling ajax GET for finding one record for a type of model and an id.
     You can mock failed find by passing in success argument as false.

   ```js
     // Pass in the parameters you would normally pass into FactoryGuy.make,
     // like fixture name, number of fixtures to make, and optional traits,
     // or fixture options
     testHelper.handleFindOne('user', 'with_hats', {id: 1});

     store.find('user', 1).then(function(user){

     });
   ```

     @param {String} name  name of the fixture ( or model ) to find
     @param {String} trait  optional traits (one or more)
     @param {Object} opts  optional fixture options (including id)
   */
  handleFind: function () {
    var args = Array.prototype.slice.call(arguments)
    Ember.assert("To handleFindOne pass in a model instance or a type and model options", args.length>0)

    var record, modelName;
    if (args[0] instanceof DS.Model) {
      record = args[0];
      modelName = record.constructor.typeKey;
    } else {
      // make the record and load it in the store
      record = FactoryGuy.make.apply(FactoryGuy, arguments);
      var name = arguments[0];
      modelName = FactoryGuy.lookupModelForFixtureName(name);
    }

    var responseJson = {};
    var json = record.toJSON({includeId: true});
    responseJson[modelName.pluralize()] = json;
    var url = this.buildURL(modelName, record.id);
    this.stubEndpointForHttpRequest(url, responseJson);
  },
  handleFindOne: function() { this.handleFind.apply(this, arguments) },
  /**
   Handling ajax GET for finding all records for a type of model with query parameters.


   ```js

     // Create model instances
     var users = FactoryGuy.makeList('user', 2, 'with_hats');

     // Pass in the array of model instances as last argument
     testHelper.handleFindQuery('user', ['name', 'age'], users);

     store.findQuery('user', {name:'Bob', age: 10}}).then(function(userInstances){
        /// userInstances will be the same of the users that were passed in
     })
   ```

      By omitting the last argument (pass in no records), this simulates a findQuery
      request that returns no records

   ```js
   // Simulate a query that returns no results
   testHelper.handleFindQuery('user', ['age']);

   store.findQuery('user', {age: 10000}}).then(function(userInstances){
        /// userInstances will be empty
     })
   ```

   @param {String} modelName  name of the mode like 'user' for User model type
   @param {String} searchParams  the parameters that will be queried
   @param {Array}  array of DS.Model records to be 'returned' by query
   */
  handleFindQuery: function (modelName, searchParams, records) {
    Ember.assert('The second argument of searchParams must be an array',Em.typeOf(searchParams) == 'array')
    if (records) {
      Ember.assert('The third argument ( records ) must be an array - found type:' + Em.typeOf(records), Em.typeOf(records) == 'array')
    } else {
      records = []
    }
    var json = records.map(function(record) {return record.toJSON({includeId: true})})
    var responseJson = {};
    responseJson[modelName.pluralize()] = json;
    var url = this.buildURL(modelName);
    this.stubEndpointForHttpRequest(url, responseJson, {urlParams: searchParams});
  },
  /**
   Handling ajax POST ( create record ) for a model. You can mock
   failed create by passing in success argument as false.

   ```js
     handleCreate('post')
     handleCreate('post', { match: {title: 'foo'} )
     handleCreate('post', { match: {title: 'foo', user: user} )
     handleCreate('post', { returns: {createdAt: new Date()} )
     handleCreate('post', { match: {title: 'foo'}, returns: {createdAt: new Date()} )
     handleCreate('post', { match: {title: 'foo'}, success: false} } )
   ```

    match - attributes that must be in request json,
    returns - attributes to include in response json,
    succeed - flag to indicate if the request should succeed ( default is true )

    Note:
     1) Any attributes in match will be added to the response json automatically,
    so you don't need to include them in the returns hash.

     2) As long as all the match attributes are found in the record being created,
     the create will succeed. In other words, there may be other attributes in the
     createRecord call, but you don't have to match them all. For example:

      ```js
        handleCreate('post', {match: {title: 'foo'})
        store.createRecord('post', {title: 'foo', created_at: new Date()})
      ```

     2) If you match on a belongsTo association, you don't have to include that in the
    returns hash either.

   @param {String} modelName  name of model your creating like 'profile' for Profile
   @param {Object} options  hash of options for handling request
   */
  handleCreate: function (modelName, options) {
    var opts = options === undefined ? {} : options;
    var store = this.getStore()
    var succeed = opts.succeed === undefined ? true : opts.succeed;
    var match = opts.match || {};
    var returnArgs = opts.returns || {};

    if (opts.match) {
      var record = store.createRecord(modelName, match);
      var expectedRequest = record.serialize();
    }

    var responseJson = {};
    if (succeed) {
      var definition = FactoryGuy.modelDefinitions[modelName];
      responseJson[modelName] = $.extend({id: definition.nextId()}, match, returnArgs);
      // Remove belongsTo associations since they will already be set when you called
      // createRecord, so they don't need to be returned.
      var modelType = store.modelFor(modelName)
      Ember.get(modelType, 'relationshipsByName').forEach(function (relationship) {
        if (relationship.kind == 'belongsTo') {
          delete responseJson[modelName][relationship.key];
        }
      })
    }

    var url = this.buildURL(modelName);

    var handler = function(settings) {
      if (settings.url != url || settings.type != 'POST') { return false}

      if (opts.match) {
        var requestData = JSON.parse(settings.data)[modelName];
        for (attribute in expectedRequest) {
          if (expectedRequest[attribute] && requestData[attribute] != expectedRequest[attribute]) {
            return false
          }
        }
      }
      var responseStatus = (succeed ? 200: 500);
      return {
        responseText: responseJson,
        status: responseStatus
      };
    }

    $.mockjax(handler);
  },

  /**
   Handling ajax PUT ( update record ) for a model type. You can mock
   failed update by passing in success argument as false.

   @param {String} type  model type like 'user' for User model
   @param {String} id  id of record to update
   @param {Boolean} succeed  optional flag to indicate if the request
      should succeed ( default is true )
   */
  handleUpdate: function () {
    var args = Array.prototype.slice.call(arguments)
    Ember.assert("To handleUpdate pass in a model instance or a type and an id", args.length>0)
    var succeed = true;
    if (typeof args[args.length-1] == 'boolean') {
      args.pop()
      succeed = false;
    }
    Ember.assert("To handleUpdate pass in a model instance or a type and an id",args.length>0)
    var type, id;
    if (args[0] instanceof DS.Model) {
      var model = args[0];
      type = model.constructor.typeKey;
      id = model.id;
    } else if (typeof args[0] == "string" && typeof parseInt(args[1]) == "number") {
      type = args[0];
      id = args[1];
    }
    Ember.assert("To handleUpdate pass in a model instance or a type and an id",type && id)
    this.stubEndpointForHttpRequest(this.buildURL(type, id), {}, {
      type: 'PUT',
      status: succeed ? 200 : 500
    });
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
    this.stubEndpointForHttpRequest(this.buildURL(type, id), {}, {
      type: 'DELETE',
      status: succeed ? 200 : 500
    });
  },
  teardown: function () {
    FactoryGuy.resetModels(this.getStore());
    $.mockjax.clear();
  }
});

if (FactoryGuy !== undefined) {
  FactoryGuy.testMixin = FactoryGuyTestMixin;
};
