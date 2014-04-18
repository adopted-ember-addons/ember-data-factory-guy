FactoryGuy = Ember.Object.reopenClass({
  fixtureStore: {},
  fixtureLookup: {},
  modelIds: {},

  /**
   ```javascript

     User = DS.Model.extend({
        name: DS.attr('string'),
     })

     FactoryGuy.define('user', {
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

      FactoryGuy.build('user') or FactoryGuy.build('bob')

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

      FactoryGuy.build('user') for User model
      FactoryGuy.build('bob') for User model with bob attributes

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
    Clear model instances from FIXTURES array, and from store cache.
    Reset the id sequence for the models back to zero.
   */
  resetModels: function (store) {
    for (model in store.typeMaps()) {
      var type = model.type
      store.modelFor(type).FIXTURES = [];
      store.unloadAll(type);
      this.modelIds[type] = 0;
    }
  },

  /**
    Push fixture to model's FIXTURES array.
    Used when store's adapter is a DS.FixtureAdapter.

    @param modelClass DS.Model type
    @param fixture the fixture to add
   */
  pushFixture: function (modelClass, fixture) {
    if (!modelClass['FIXTURES']) {
      modelClass['FIXTURES'] = [];
    }
    modelClass['FIXTURES'].push(fixture);
    return fixture;
  }
})