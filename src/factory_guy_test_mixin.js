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

   */
  make: function () {
    var store = this.getStore();
    return store.makeFixture.apply(store, arguments);
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

     @param {String} name  name of the fixture ( or model ) to find
     @param {Number} number  number of fixtures to create
     @param {String} trait  optional traits (one or more)
     @param {Object} opts  optional fixture options
   */
  handleFindMany: function () {
    var store = this.getStore();
    // make the records and load them in the store
    store.makeList.apply(store,arguments);

    var name = arguments[0];
    var modelName = FactoryGuy.lookupModelForFixtureName(name);
    var responseJson = {};
    responseJson[modelName]=[];
    var url = this.buildURL(modelName);
    // mock the ajax call, but return nothing, since the records will be
    // retrieved from the store where they were just loaded above
    this.stubEndpointForHttpRequest(url, responseJson, {type: 'GET'})
  },

  /**
   Handling ajax POST ( create record ) for a model. You can mock
   failed create by passing in success argument as false.

   @param {String} name  name of the fixture ( or model ) to create
   @param {String} trait  optional traits ( one or more )
   @param {Object} opts  optional fixture options
   @param {Boolean} succeed  optional flag to indicate if the request
      should succeed ( default is true )
   */
  handleCreate: function () {
    var args = Array.prototype.slice.call(arguments);

    var succeed = true;
    if (Ember.typeOf(args[args.length-1]) == 'boolean') {
      succeed = args.pop();
    }

    var name = args[0];
    var modelName = FactoryGuy.lookupModelForFixtureName(name);
    var url = this.buildURL(modelName);
    var responseJson = {};
    var httpOptions = {type: 'POST'}

    if (succeed) {
      var store = this.getStore();
      // make the record and load it in the store
      var model = store.makeFixture.apply(store,args);
      // believe it or not .. this actually works
      responseJson[modelName]=model;
    } else {
      httpOptions.status = 500;
    }
    console.log('handleCreate responseJson',responseJson)
    this.stubEndpointForHttpRequest(url, responseJson, httpOptions)
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
    succeed = succeed === undefined ? true : succeed;

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
    succeed = succeed === undefined ? true : succeed;

    this.stubEndpointForHttpRequest(
      this.buildURL(type, id),
      {},
      {type: 'DELETE', status: (succeed ? 200 : 500)}
    )
  },

  teardown: function () {
    FactoryGuy.resetModels(this.getStore());
    $.mockjax.clear();
  }
});
