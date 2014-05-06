FactoryGuy = {
  modelDefinitions: {},

  /**
   ```javascript

   Person = DS.Model.extend({
     type: DS.attr('string'),
     name: DS.attr('string')
   })

   FactoryGuy.define('person', {
     sequences: {
       personName: function(num) {
         return 'person #' + num;
       },
       personType: function(num) {
         return 'person type #' + num;
       }
     },
     default: {
       type: 'normal',
       name: FactoryGuy.generate('personName')
     },
     dude: {
       type: FactoryGuy.generate('personType')
     },
   });

   ```

   For the Person model, you can define fixtures like 'dude' or just use 'person'
   and get default values.

   And to get those fixtures you would call them this way:

   FactoryGuy.build('person') or FactoryGuy.build('dude')

   @param model the model to define
   @param config your model definition object
   */
  define: function (model, config) {
    if (this.modelDefinitions[model]) {
      this.modelDefinitions[model].merge(config);
    } else {
      this.modelDefinitions[model] = new ModelDefinition(model, config);
    }
  },

  generate: function (sequenceName) {
    return function () {
      return this.generate(sequenceName);
    }
  },


  /**

   @param name fixture name could be model name like 'user'
   or specific user like 'admin'
   @returns model associated with fixture name
   */
  lookupModelForName: function (name) {
    for (model in this.modelDefinitions) {
      var definition = this.modelDefinitions[model];
      if (definition.matchesName(name)) {
        return definition.model;
      }
    }
  },

  /**

   @param name fixture name could be model name like 'user'
   or specific user like 'admin'
   @returns definition associated with model
   */
  lookupDefinitionForName: function (name) {
    for (model in this.modelDefinitions) {
      var definition = this.modelDefinitions[model];
      if (definition.matchesName(name)) {
        return definition;
      }
    }
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
    var definition = this.lookupDefinitionForName(name);
    if (!definition) {
      throw new Error("Can't find that factory named [" + name + "]");
    }
    return definition.build(name, opts);
  },

  /**
   Build list of fixtures for model or specific fixture name. For example:

   FactoryGuy.buildList('user', 2) for 2 User models
   FactoryGuy.build('bob', 2) for 2 User model with bob attributes

   @param name fixture name
   @param number number of fixtures to create
   @param opts options that will override default fixture values
   @returns list of fixtures
   */
  buildList: function (name, number, opts) {
    var definition = this.lookupDefinitionForName(name);
    if (!definition) {
      throw new Error("Can't find that factory named [" + name + "]");
    }
    return definition.buildList(name, number, opts);
  },

  /**
   Clear model instances from FIXTURES array, and from store cache.
   Reset the id sequence for the models back to zero.
   */
  resetModels: function (store) {
    var typeMaps = store.typeMaps;
    for (model in this.modelDefinitions) {
      var definition = this.modelDefinitions[model];
      definition.reset();
      try {
        var modelType = store.modelFor(definition.model);
        if (store.usingFixtureAdapter()) {
          modelType.FIXTURES = [];
        }
        store.unloadAll(modelType);
      } catch (e) {
      }
//    } else {
//      for (model in typeMaps) {
//        store.unloadAll(typeMaps[model].type);
//      }
//    }

//    for (model in this.modelDefinitions) {
//      this.modelDefinitions[model].reset();
    }
  },

  /**
   Push fixture to model's FIXTURES array.
   Used when store's adapter is a DS.FixtureAdapter.

   @param modelClass DS.Model type
   @param fixture the fixture to add
   @returns json fixture data
   */
  pushFixture: function (modelClass, fixture) {
    if (!modelClass['FIXTURES']) {
      modelClass['FIXTURES'] = [];
    }
    modelClass['FIXTURES'].push(fixture);
    return fixture;
  }
}