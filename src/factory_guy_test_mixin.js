FactoryGuyTestMixin = Em.Mixin.create({

  // Pass in the app root, which typically is App.
  setup: function (app) {
    this.set('container', app.__container__);
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
    var store = this.getStore()
    var type = store.modelFor(type);
    var serializer = store.serializerFor(type.typeKey);
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
   Proxy to store's makeFixture method

   @param {String} name name of fixture
   @param {Object} options fixture options
   @returns {Object|DS.Model} json or record depending on the adapter type
   */
  make: function (name, opts) {
    return this.getStore().makeFixture(name, opts);
  },

  getStore: function () {
    return this.get('container').lookup('store:main');
  },

  pushPayload: function (type, hash) {
    return this.getStore().pushPayload(type, hash);
  },

  pushRecord: function (type, hash) {
    return this.getStore().push(type, hash);
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
    }

    if (options.data) {
      request.data = options.data
    }

    $.mockjax(request);
  },


  /**
   Build the json used for creating or finding a record.

   @param {String} modelName model name like 'user'
   @param {String} fixture the fixture data
   @return {Object} json response used for mocking a request
   */
  buildAjaxHttpResponse: function (modelName, fixture) {
    if (this.usingActiveModelSerializer(modelName)) {
      this.toSnakeCase(fixture);
    }
    var hash = {};
    hash[modelName] = fixture;
    return hash;
  },


  _collectArgs: function (args, fromMethod) {
    var args = Array.prototype.slice.call(arguments);
    var name = args.shift();
    if (!name) {
      throw new Error(fromMethod + " needs a factory name to build");
    }
    var succeed = true;
    if (Ember.typeOf(args[args.length-1]) == 'boolean') {
      succeed  = args.pop();
    }
    var opts = {}
    if (Ember.typeOf(args[args.length-1]) == 'object') {
      opts  = args.pop();
    }
    var traits = args; // whatever is left are traits

    return {name: name, traits: traits, opts: opts, succeed: succeed}
  },

  /**
   Convert Object's keys to snake case

   @param {Object} fixture to convert
   */
  toSnakeCase: function (fixture) {
    for (key in fixture) {
      if (key != Em.String.decamelize(key)) {
        var value = fixture[key];
        delete fixture[key];
        fixture[Em.String.decamelize(key)] = value
      }
    }
  },

  /**
   Build url for the mockjax call. Proxy to the adapters buildURL method.

   @param {String} type model type name like 'user' for User model
   @param {String} id
   @return {String} url
   */
  buildURL: function (type, id) {
    return this.getStore().adapterFor('application').buildURL(type, id);
  },

  handleSideloadFind: function (modelName, json, sideload) {
    var id = json.id
    var url = this.buildURL(modelName, id);
    var responseJson = {};
    responseJson[modelName] = json;
    $.extend(responseJson, sideload)

    this.stubEndpointForHttpRequest(
      url,
      responseJson,
      {type: 'GET', status: (status || 200)}
    )
  },


  /**
     Handling ajax GET ( find record ) for a model. You can mock
     failed find by passing in success flag as false.

     @param {String} name  name of the fixture to find
     @param {String} trait  optional traits ( one or more )
     @param {Object} opts  optional fixture options
     @param {Boolean} succeed  optional flag to indicate if the request
        should succeed ( default is true )
     */
  handleFind: function () {
    var args = Array.prototype.slice.call(arguments);
    var name = args.shift();
    if (!name) {
      throw new Error("handleFind needs a factory name to build");
    }
    var succeed = true;
    if (Ember.typeOf(args[args.length-1]) == 'boolean') {
      succeed  = args.pop();
    }
    var opts = {}
    if (Ember.typeOf(args[args.length-1]) == 'object') {
      opts  = args.pop();
    }
    var traits = args; // whatever is left are traits

    var fixture = FactoryGuy.build(name, traits, opts);
    var modelName = FactoryGuy.lookupModelForFixtureName(name);
    var responseJson = this.buildAjaxHttpResponse(modelName, fixture);
    var id = responseJson[modelName].id
    var url = this.buildURL(modelName, id);

    this.stubEndpointForHttpRequest(
      url,
      responseJson,
      {type: 'GET', status: (succeed ? 200 : 500)}
    )
    return responseJson;
  },

  /**
     Handling ajax GET for finding all records for a type of model.
     You can mock failed find by passing in success argument as false.

     @param {String} name  name of the fixture ( or model ) to find
     @param {Number} number  number of fixtures to create
     @param {String} trait  optional traits (one or more)
     @param {Object} opts  optional fixture options
     @param {Boolean} succeed  optional flag to indicate if the request
        should succeed ( default is true )
     @return {Object} json response
   */
  handleFindMany: function () {
    var args = Array.prototype.slice.call(arguments);
    var name = args.shift();
    var number = args.shift();
    if (!name || !number) {
      throw new Error("handleFindMany needs a name and a number ( at least ) to build fixture with");
    }
    var succeed = true;
    if (Ember.typeOf(args[args.length-1]) == 'boolean') {
      succeed  = args.pop();
    }
    var opts = {}
    if (Ember.typeOf(args[args.length-1]) == 'object') {
      opts  = args.pop();
    }
    var traits = args; // whatever is left are traits

    var fixture = FactoryGuy.buildList(name, number, traits, opts);
    var modelName = FactoryGuy.lookupModelForFixtureName(name);
    var responseJson = this.buildAjaxHttpResponse(modelName, fixture);
    var url = this.buildURL(modelName);

    this.stubEndpointForHttpRequest(
      url,
      responseJson,
      {type: 'GET', status: (succeed ? 200 : 500)}
    )

    return responseJson;
  },

  /**
   Handling ajax POST ( create record ) for a model. You can mock
   failed create by passing in success argument as false.

   @param {String} name  name of the fixture ( or model ) to create
   @param {String} trait  optional traits ( one or more )
   @param {Object} opts  optional fixture options
   @param {Boolean} succeed  optional flag to indicate if the request
      should succeed ( default is true )
   @return {Object} json response
   */
  handleCreate: function () {
    var args = Array.prototype.slice.call(arguments);
    var name = args.shift();
    if (!name) {
      throw new Error("handleCreate needs a factory name to build");
    }
    var succeed = true;
    if (Ember.typeOf(args[args.length-1]) == 'boolean') {
      succeed  = args.pop();
    }
    var opts = {}
    if (Ember.typeOf(args[args.length-1]) == 'object') {
      opts  = args.pop();
    }
    var traits = args; // whatever is left are traits

    var fixture = FactoryGuy.build(name, traits, opts);
    var modelName = FactoryGuy.lookupModelForFixtureName(name);
    var responseJson = this.buildAjaxHttpResponse(modelName, fixture);
    var url = this.buildURL(modelName);

    this.stubEndpointForHttpRequest(
      url,
      responseJson,
      {type: 'POST', status: (succeed ? 200 : 500)}
    )

    return responseJson;
  },

  /**
   Handling ajax PUT ( update record ) for a model type. You can mock
   failed update by passing in success argument as false.

   @param {String} type  model type like 'user' for User model
   @param {String} id  id of record to update
   @param {Boolean} succeed  optional flag to indicate if the request
      should succeed ( default is true )
   */
  handleUpdate: function (type, id, succeed) {
    succeed = succeed || true
    this.stubEndpointForHttpRequest(
      this.buildURL(type, id),
      {},
      {type: 'PUT', status: (succeed ? 200 : 500)}
    )
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
    succeed = succeed || true
    this.stubEndpointForHttpRequest(
      this.buildURL(type, id),
      {},
      {type: 'DELETE', status: (succeed ? 200 : 500)}
    )
  },

  teardown: function () {
    FactoryGuy.resetModels(this.getStore());
  }
});