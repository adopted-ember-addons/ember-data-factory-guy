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
   Build the json used for creating record

   @param {String} name of the fixture ( or model ) to create
   @param {Object} opts fixture options
   */
  buildAjaxHttpResponse: function (name, opts) {
    var fixture = FactoryGuy.build(name, opts);
    var modelName = FactoryGuy.lookupModelForFixtureName(name);
    if (this.usingActiveModelSerializer(modelName)) {
      this.toSnakeCase(fixture);
    }
    var hash = {};
    hash[modelName] = fixture;
    return hash;
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
   Handling ajax GET ( find record ) for a model. You can mock
   failed find by passing in status of 500.

   @param {String} name of the fixture ( or model ) to find
   @param {Object} opts fixture options
   @param {Integer} status Optional HTTP status response code
   */
  handleFind: function (name, opts, status) {
    var modelName = FactoryGuy.lookupModelForFixtureName(name);
    var responseJson = this.buildAjaxHttpResponse(name, opts);
    var id = responseJson[modelName].id
    var url = "/" + Em.String.pluralize(modelName) + "/" + id;
    this.stubEndpointForHttpRequest(
      url,
      responseJson,
      {type: 'GET', status: (status || 200)}
    )
    return responseJson;
  },

  /**
   Handling ajax POST ( create record ) for a model. You can mock
   failed create by passing in status of 500.

   @param {String} name of the fixture ( or model ) to create
   @param {Object} opts fixture options
   @param {Integer} status Optional HTTP status response code
   */
  handleCreate: function (name, opts, status) {
    var modelName = FactoryGuy.lookupModelForFixtureName(name);
    var responseJson = this.buildAjaxHttpResponse(name, opts);
    var url = "/" + Em.String.pluralize(modelName);
    this.stubEndpointForHttpRequest(
      url,
      responseJson,
      {type: 'POST', status: (status || 200)}
    )
    return responseJson;
  },

  /**
   Handling ajax PUT ( update record ) for a model type. You can mock
   failed update by passing in status of 500.

   @param {String} root modelType like 'user' for User
   @param {String} id id of record to update
   @param {Integer} status Optional HTTP status response code
   */
  handleUpdate: function (root, id, status) {
    this.stubEndpointForHttpRequest(
        "/" + Em.String.pluralize(root) + "/" + id,
      {},
      {type: 'PUT', status: (status || 200)}
    )
  },

  /**
   Handling ajax DELETE ( delete record ) for a model type. You can mock
   failed delete by passing in status of 500.

   @param {String} root modelType like 'user' for User
   @param {String} id id of record to update
   @param {Integer} status Optional HTTP status response code
   */
  handleDelete: function (root, id, status) {
    this.stubEndpointForHttpRequest(
        "/" + Em.String.pluralize(root) + "/" + id,
      {},
      {type: 'DELETE', status: (status || 200)}
    )
  },

  teardown: function () {
    FactoryGuy.resetModels(this.getStore());
  }
})