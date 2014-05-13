FactoryGuyTestMixin = Em.Mixin.create({

  // Pass in the app root, which typically is App.
  setup: function(app) {
    this.set('container', app.__container__);
    return this;
  },

  useFixtureAdapter: function(app) {
    app.ApplicationAdapter = DS.FixtureAdapter;
    this.getStore().adapterFor('application').simulateRemoteResponse = false;
  },

  /**
   Proxy to store's find method

   @param {String or subclass of DS.Model} type
   @param {Object|String|Integer|null} id
   @return {Promise} promise
   */
  find: function(type, id) {
    return this.getStore().find(type, id);
  },

  make: function(name, opts) {
    return this.getStore().makeFixture(name, opts);
  },

  getStore: function () {
    return this.get('container').lookup('store:main');
  },

  pushPayload: function(type, hash) {
    return this.getStore().pushPayload(type, hash);
  },

  pushRecord: function(type, hash) {
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
    Handling ajax POST ( create record ) for a model

    @param {String} name of the fixture ( or model ) to create
    @param {Object} opts fixture options
   */
  handleCreate: function (name, opts) {
    var model = FactoryGuy.lookupModelForFixtureName(name);
    this.stubEndpointForHttpRequest(
      "/" + Em.String.pluralize(model),
      this.buildAjaxCreateResponse(name, opts),
      {type: 'POST'}
    )
  },

  /**
    Build the json used for creating record

    @param {String} name of the fixture ( or model ) to create
    @param {Object} opts fixture options
¬  */
  buildAjaxCreateResponse: function (name, opts) {
    var fixture = FactoryGuy.build(name, opts);
    var model = FactoryGuy.lookupModelForFixtureName(name);
    var hash = {};
    hash[model] = fixture;
    return hash;
  },

  /**
    Handling ajax PUT ( update record ) for a model type

    @param {String} root modelType like 'user' for User
    @param {String} id id of record to update
   */
  handleUpdate: function (root, id) {
    this.stubEndpointForHttpRequest(
      "/" + Em.String.pluralize(root) + "/" + id, {}, {type: 'PUT'}
    )
  },

  /**
    Handling ajax DELETE ( delete record ) for a model type

    @param {String} root modelType like 'user' for User
    @param {String} id id of record to update
   */
  handleDelete: function (root, id) {
    this.stubEndpointForHttpRequest(
      "/" + Em.String.pluralize(root) + "/" + id, {}, {type: 'DELETE'}
    )
  },

  teardown: function () {
    FactoryGuy.resetModels(this.getStore());
  }
})