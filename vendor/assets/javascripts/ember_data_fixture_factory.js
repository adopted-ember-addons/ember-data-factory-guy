FixtureFactory = Ember.Object.reopenClass({
  fixtureStore: {},
  fixtureLookup: {},
  modelIds: {},

  /**
   ```javascript

     User = DS.Model.extend({
        name: DS.attr('string'),
     })

     FixtureFactory.define('user', {
        default: {
          name: "Fred"
        },

        bob: {
          name: "Bob"
        }
     });

    ```

     For the User model, you can define fixtures like 'bob' or just use 'user'
     and get default values.

     And to get those fixtures you would call them this way:

      FixtureFactory.build('user') or FixtureFactory.build('bob')

    @param model the model to define
    @param config your default and specific fixtures
   */
  define: function (model, config) {
    var info = this.getModelInfo(model);
    for (key in config) {
      var value = config[key];
      info[key] = value;
      if (key != 'default') {
        this.fixtureLookup[key] = model;
      }
    }
    // setup id
    this.modelIds[model] = 0;
  },

  /**

    @param model
   */
  getModelInfo: function (model) {
    if (!this.fixtureStore[model]) {
      this.fixtureStore[model] = {};
    }
    return this.fixtureStore[model];
  },

  /**

    @param name fixture name
    @returns model associated with fixture name
   */
  lookupModelForName: function (name) {
    var model = this.fixtureLookup[name];
    if (!model) {
      if (this.fixtureStore[name]) {
        model = name;
      }
    }
    return model;
  },

  /**
    Generate next id for model
   */
  generateId: function (model) {
    var lastId = this.modelIds[model];
    this.modelIds[model] = lastId + 1;
    return this.modelIds[model];
  },

  /**
    Build fixtures for model or specific fixture name. For example:

      FixtureFactory.build('user') for User model
      FixtureFactory.build('bob') for User model with bob attributes

    @param name fixture name
    @param opts options that will override default fixture values
    @returns {*}
   */
  build: function (name, opts) {
    var model = this.lookupModelForName(name);
    if (!model) {
      throw new Error("can't find that factory named [" + name + "]");
    }

    var modelInfo = this.fixtureStore[model];
    var modelAttributes = modelInfo[name] || {};
    var defaultModelAttributes = modelInfo.default;
    var fixture = $.extend({}, defaultModelAttributes, modelAttributes, opts);
    fixture.id = this.generateId(model);
    return fixture;
  },

  /**
    Clear model instances from FIXTURES array,
    and from store cache.
    Reset the id sequence for the models back to zero.
   */
  resetModels: function (store) {
    for (model in this.fixtureStore) {
      store.modelFor(model).FIXTURES = [];
      store.unloadAll(model);
      this.modelIds[model] = 0;
    }
  },

  /**
    Push fixture to model's FIXTURES array

    @param model
    @param fixture
   */
  pushFixture: function (modelClass, fixture) {
    if (!modelClass['FIXTURES']) {
      modelClass['FIXTURES'] = [];
    }
    modelClass['FIXTURES'].push(fixture);
    return fixture;
  }
})
DS.Store.reopen({
  /**
    Make new fixture and save to store. If the store is using FixtureAdapter,
    will push to FIXTURE array, otherwise will use push method on adapter.

    @param name
    @param options
    @returns {*}
   */
  makeFixture: function (name, options) {
    var modelName = FixtureFactory.lookupModelForName(name);
    var fixture = FixtureFactory.build(name, options);
    var modelType = this.modelFor(modelName);

    var adapter = this.adapterFor('application');
    if (adapter.toString().match('Fixture')) {
      this.setBelongsToFixturesAssociation(modelType, modelName, fixture);
      return FixtureFactory.pushFixture(modelType, fixture);
    } else {
      var model = this.push(modelName, fixture);
      return model;
    }
  },

  /**
    Trying to set the belongsTo association for FixtureAdapter,
      with models that have a hasMany association.

    For example if a client hasMany projects, then set the client.id
    on each project that the client hasMany of, so that the project
    now has the belongsTo client association setup.

    @param name
    @param model
   */
  setBelongsToFixturesAssociation: function (modelType, modelName, parentFixture) {
    var store = this;
    var adapter = this.adapterFor('application');
    var relationShips = Ember.get(modelType, 'relationshipNames');

    if (relationShips.hasMany) {
      relationShips.hasMany.forEach(function (name) {
        var hasManyModel = store.modelFor(Em.String.singularize(name));
        var hasManyfixtures = adapter.fixturesForType(hasManyModel);
        if (hasManyfixtures) {
          hasManyfixtures.forEach(function(fixture) {
            fixture[modelName] = parentFixture.id
          })
        }
      })
    }
  },

  /**
    Adding a pushPayload for FixtureAdapter, but using the original with
     other adapters that support pushPayload.

    @param type
    @param payload
   */
  pushPayload: function (type, payload) {
    var adapter = this.adapterFor('application');
    if (adapter.toString().match('Fixture')) {
      var model = this.modelFor(modelName);
      FixtureFactory.pushFixture(model, payload);
    } else {
      this._super(type, payload)
    }
  }
})
FixtureFactoryHelperMixin = Em.Mixin.create({

  store: function(){
    this.get('container').lookup('store:main');
  }.property('container'),

  setup: function(app) {
    this.set('container', app.__container__);
    return this;
  },

  useFixtureAdapter: function(app) {
    app.ApplicationAdapter = DS.FixtureAdapter;
    this.getStore().adapterFor('application').simulateRemoteResponse = false;
  },

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
   * Handling ajax POST for a model
   *
   * @param name of the fixture ( or model ) to create
   * @param opts fixture options
   */
  handleCreate: function (name, opts) {
    var model = FixtureFactory.lookupModelForName(name);
    this.stubEndpointForHttpRequest(
      "/" + Em.String.pluralize(model),
      this.buildAjaxResponse(name, opts),
      {type: 'POST'}
    )
  },

  buildAjaxResponse: function (name, opts) {
    var fixture = FixtureFactory.build(name, opts);
    var model = FixtureFactory.lookupModelForName(name);
    var hash = {};
    hash[model] = fixture;
    return hash;
  },

  handleUpdate: function (model) {
    var root = Em.String.pluralize(model.rootForType());
    this.stubEndpointForHttpRequest(
      "/" + root + "/" + model.get('id'), {}, {type: 'PUT'}
    )
  },

  handleDelete: function (root, id) {
    this.stubEndpointForHttpRequest(
      "/" + Em.String.pluralize(root) + "/" + id, {}, {type: 'DELETE'}
    )
  },

  teardown: function () {
    FixtureFactory.resetModels(this.getStore());
  }

})