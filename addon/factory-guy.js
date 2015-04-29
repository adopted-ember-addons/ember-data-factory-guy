import Ember from 'ember';
import DS from 'ember-data';
import ModelDefinition from './model-definition';

var FactoryGuy = {
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

   For the Person model, you can define named fixtures like 'dude' or
   just use 'person' and get default values.

   And to get those fixtures you would call them this way:

   FactoryGuy.build('dude') or FactoryGuy.build('person')

   @param {String} model the model to define
   @param {Object} config your model definition
   */
  define: function (model, config) {
    this.modelDefinitions[model] = new ModelDefinition(model, config);
  },
  /**
   Used for setting the store in FactoryGuy, when used without test mixin.
   */
  setup: function (app) {
    Ember.assert("FactoryGuy#setup needs a valid application instance.You passed in [" + app + "]", app instanceof Ember.Application);
    this.setStore(app.__container__.lookup('store:main'));
  },
  /**
   Setting the store so FactoryGuy can do some model introspection.
   */
  setStore: function (store) {
    Ember.assert("FactoryGuy#setStore needs a valid store instance.You passed in [" + store + "]", store instanceof DS.Store);
    this.store = store;
  },
  getStore: function () {
    return this.store;
  },
  /**
   Checks a model's attribute to determine if it's a relationship.

   @param {String} typeName  model type name like 'user' for User model class
   @param {String} attribute  attribute you want to check
   @returns {Boolean} true if the attribute is a relationship, false if not
   */
  getAttributeRelationship: function (typeName, attribute) {
    if (!this.store) {
      Ember.debug("FactoryGuy does not have the application's store. Use FactoryGuy.setStore(store) before making any fixtures");
      // The legacy value was true.
      return true;
    }
    var model = this.store.modelFor(typeName);
    var relationship = model.typeForRelationship(attribute);
    return !!relationship ? relationship : null;
  },
  /**
   Used in model definitions to declare use of a sequence. For example:

   ```

   FactoryGuy.define('person', {
     sequences: {
       personName: function(num) {
         return 'person #' + num;
       }
     },
     default: {
       name: FactoryGuy.generate('personName')
     }
   });

   ```

   @param   {String|Function} value previously declared sequence name or
   an inline function to use as the sequence
   @returns {Function} wrapper function that is called by the model
   definition containing the sequence
   */
  generate: function (nameOrFunction) {
    var sortaRandomName = Math.floor((1 + Math.random()) * 65536).toString(16) + Date.now();
    return function () {
      if (Ember.typeOf(nameOrFunction) === 'function') {
        return this.generate(sortaRandomName, nameOrFunction);
      } else {
        return this.generate(nameOrFunction);
      }
    };
  },
  /**
   Used in model definitions to define a belongsTo association attribute.
   For example:

   ```
   FactoryGuy.define('project', {
       default: {
         title: 'Project'
       },

       // setup named project with built in associated user
       project_with_admin: {
         user: FactoryGuy.belongsTo('admin')
       }

       // or use as a trait
       traits: {
         with_admin: {
           user: FactoryGuy.belongsTo('admin')
         }
       }
     })
   ```

   @param   {String} fixtureName fixture name
   @param   {Object} opts options
   @returns {Function} wrapper function that will build the association json
   */
  belongsTo: function (fixtureName, opts) {
    return function () {
      return FactoryGuy.build(fixtureName, opts);
    };
  },
  association: function (fixtureName, opts) {
    Ember.deprecate('DEPRECATION Warning: use FactoryGuy.belongsTo instead');
    return this.belongsTo(fixtureName, opts);
  },
  /**
   Used in model definitions to define a hasMany association attribute.
   For example:

   ```
   FactoryGuy.define('user', {
     default: {
       name: 'Bob'
     },

     // define the named user type that will have projects
     user_with_projects: { FactoryGuy.hasMany('project', 2) }

     // or use as a trait
     traits: {
       with_projects: {
         projects: FactoryGuy.hasMany('project', 2)
       }
     }
   })

   ```

   @param   {String} fixtureName fixture name
   @param   {Number} number of hasMany association items to build
   @param   {Object} opts options
   @returns {Function} wrapper function that will build the association json
   */
  hasMany: function (fixtureName, number, opts) {
    return function () {
      return FactoryGuy.buildList(fixtureName, number, opts);
    };
  },
  /**
   Given a fixture name like 'person' or 'dude' determine what model this name
   refers to. In this case it's 'person' for each one.

   @param {String} name  a fixture name could be model name like 'person'
   or a named person in model definition like 'dude'
   @returns {String} model  name associated with fixture name or undefined if not found
   */
  lookupModelForFixtureName: function (name) {
    var definition = this.lookupDefinitionForFixtureName(name);
    if (definition) {
      return definition.model;
    }
  },
  /**

   @param {String} name a fixture name could be model name like 'person'
   or a named person in model definition like 'dude'
   @returns {ModelDefinition} ModelDefinition associated with model or undefined if not found
   */
  lookupDefinitionForFixtureName: function (name) {
    for (var model in this.modelDefinitions) {
      var definition = this.modelDefinitions[model];
      if (definition.matchesName(name)) {
        return definition;
      }
    }
  },
  /**
   extract arguments for build and make function
   @param {String} name  fixture name
   @param {String} trait  optional trait names ( one or more )
   @param {Object} opts  optional fixture options that will override default fixture values
   @returns {Object} json fixture
   */
  extractArguments: function () {
    var args = Array.prototype.slice.call(arguments);
    var opts = {};
    var name = args.shift();
    if (!name) {
      throw new Error('Build needs a factory name to build');
    }
    if (Ember.typeOf(args[args.length - 1]) === 'object') {
      opts = args.pop();
    }
    // whatever is left are traits
    var traits = args;
    return {name: name, opts: opts, traits: traits};
  },
  /**
   Build fixtures for model or specific fixture name. For example:

   FactoryGuy.build('user') for User model
   FactoryGuy.build('bob') for a 'bob' User
   FactoryGuy.build('bob', 'dude') for a 'bob' User with dude traits
   FactoryGuy.build('bob', 'dude', 'funny') for a 'bob' User with dude and funny traits
   FactoryGuy.build('bob', 'dude', {name: 'wombat'}) for a 'bob' User with dude trait and custom attribute name of 'wombat'

   @param {String} name  fixture name
   @param {String} trait  optional trait names ( one or more )
   @param {Object} opts  optional fixture options that will override default fixture values
   @returns {Object} json fixture
   */
  build: function () {
    var args = this.extractArguments.apply(this, arguments);

    var definition = this.lookupDefinitionForFixtureName(args.name);
    if (!definition) {
      throw new Error('Can\'t find that factory named [' + args.name + ']');
    }
    return definition.build(args.name, args.opts, args.traits);
  },
  /**
   Build list of fixtures for model or specific fixture name. For example:

   FactoryGuy.buildList('user', 2) for 2 User models
   FactoryGuy.build('bob', 2) for 2 User model with bob attributes

   @param {String} name  fixture name
   @param {Number} number  number of fixtures to create
   @param {String} trait  optional traits (one or more)
   @param {Object} opts  optional fixture options that will override default fixture values
   @returns {Array} list of fixtures
   */
  buildList: function () {
    var args = Array.prototype.slice.call(arguments);
    var name = args.shift();
    var number = args.shift();
    if (!name || !number) {
      throw new Error('buildList needs a name and a number ( at least ) to build with');
    }
    var opts = {};
    if (Ember.typeOf(args[args.length - 1]) === 'object') {
      opts = args.pop();
    }
    var traits = args;
    // whatever is left are traits
    var definition = this.lookupDefinitionForFixtureName(name);
    if (!definition) {
      throw new Error('Can\'t find that factory named [' + name + ']');
    }
    return definition.buildList(name, number, traits, opts);
  },
  /**
   Make new fixture and save to store.

   @param {String} name  fixture name
   @param {String} trait  optional trait names ( one or more )
   @param {Object} options  optional fixture options that will override default fixture values
   @returns {Object|DS.Model} json or record depending on the adapter type
   */
  make: function () {
    var args = this.extractArguments.apply(this, arguments);

    var store = this.store;
    Ember.assert(
      "FactoryGuy does not have the application's store." +
      " Use FactoryGuy.setStore(store) before making any fixtures", store
    );

    var fixture = this.build.apply(this, arguments);
    var modelName = this.lookupModelForFixtureName(args.name);
    var modelType = store.modelFor(modelName);

    var model = this.makeModel(store, modelType, fixture);

    var definition = this.lookupDefinitionForFixtureName(args.name);
    if (definition.hasAfterMake()){
      definition.applyAfterMake(model, args.opts);
    }
    return model;
  },
  /**
   Make a list of Fixtures

   @param {String} name name of fixture
   @param {Number} number number to create
   @param {String} trait  optional trait names ( one or more )
   @param {Object} options  optional fixture options that will override default fixture values
   @returns {Array} list of json fixtures or records depending on the adapter type
   */
  makeList: function () {
    Ember.assert("FactoryGuy does not have the application's store. Use FactoryGuy.setStore(store) before making any fixtures", this.store);

    var arr = [];
    var args = Array.prototype.slice.call(arguments);
    Ember.assert("makeList needs at least 2 arguments, a name and a number", args.length >= 2);
    var number = args.splice(1, 1)[0];
    Ember.assert("Second argument to makeList should be a number (of fixtures to make.)", typeof number === 'number');

    for (var i = 0; i < number; i++) {
      arr.push(this.make.apply(this, args));
    }
    return arr;
  },

  /**
   * Most of the work of making the model from the json fixture is going on here.
   * @param modelType
   * @param fixture
   * @returns {DS.Model} instance of DS.Model
   */
  makeModel: function (store, modelType, fixture) {
    var modelName = store.modelFor(modelType).typeKey;
    var model;
    var self = this;

    Ember.run(function () {
      self.findEmbeddedAssociationsForRESTAdapter(store, modelType, fixture);
      if (fixture.type) {
        // assuming its polymorphic if there is a type attribute
        // is this too bold an assumption?
        modelName = Ember.String.underscore(fixture.type);
        modelType = store.modelFor(modelName);
      }
      model = store.push(modelName, fixture);
    });
    return model;
  },

  findEmbeddedAssociationsForRESTAdapter: function (store, modelType, fixture) {
    var self = this;
    Ember.get(modelType, 'relationshipsByName').forEach(function (relationship) {
      if (relationship.kind === 'belongsTo') {
        var belongsToRecord = fixture[relationship.key];
        if (Ember.typeOf(belongsToRecord) === 'object') {
          self.findEmbeddedAssociationsForRESTAdapter(store, relationship.type, belongsToRecord);
          belongsToRecord = store.push(relationship.type, belongsToRecord);
          fixture[relationship.key] = belongsToRecord;
        }
      }
      if (relationship.kind === 'hasMany') {
        var hasManyRecords = fixture[relationship.key];
        if (Ember.typeOf(hasManyRecords) === 'array') {
          if (Ember.typeOf(hasManyRecords[0]) === 'object') {
            var records = Ember.A();
            hasManyRecords.map(function (object) {
              self.findEmbeddedAssociationsForRESTAdapter(store, relationship.type, object);
              var record = store.push(relationship.type, object);
              records.push(record);
              return record;
            });
            fixture[relationship.key] = records;
          }
        }
      }
    });
  },

  /**
   Clear model instances from store cache.
   Reset the id sequence for the models back to zero.
   */
  clearStore: function () {
    this.resetDefinitions();
    this.clearModels();
  },


  /**
   Reset the id sequence for the models back to zero.
   */
  resetDefinitions: function () {
    for (var model in this.modelDefinitions) {
      var definition = this.modelDefinitions[model];
      definition.reset();
    }
  },

  /**
   Clear model instances from store cache.
   */
  clearModels: function () {
    for (var model in this.modelDefinitions) {
      var definition = this.modelDefinitions[model];
      var modelType = this.store.modelFor(definition.model);
      this.store.unloadAll(modelType);
    }
  },

  /**
   Push fixture to model's FIXTURES array.
   Used when store's adapter is a DS.FixtureAdapter.

   @param {DS.Model} modelClass
   @param {Object} fixture the fixture to add
   @returns {Object} json fixture data
   */
  pushFixture: function (modelClass, fixture) {
    var index;
    if (!modelClass.FIXTURES) {
      modelClass.FIXTURES = [];
    }

    index = this.indexOfFixture(modelClass.FIXTURES, fixture);

    if (index > -1) {
      modelClass.FIXTURES.splice(index, 1);
    }

    modelClass.FIXTURES.push(fixture);

    return fixture;
  },

  /**
   Used in compliment with pushFixture in order to
   ensure we don't push duplicate fixtures

   @private
   @param {Array} fixtures
   @param {String|Integer} id of fixture to find
   @returns {Object} fixture
   */
  indexOfFixture: function (fixtures, fixture) {
    var index = -1,
      id = fixture.id + '';
    Ember.A(fixtures).find(function (r, i) {
      if ('' + Ember.get(r, 'id') === id) {
        index = i;
        return true;
      } else {
        return false;
      }
    });
    return index;
  },

  /**
   Clears all model definitions
   */
  clearDefinitions: function (opts) {
    if (!opts) {
      this.modelDefinitions = {};
    }
  }

};

//To accomodate for phantomjs ( which does not recognise bind method ( for now )
var make = function () {
  return FactoryGuy.make.apply(FactoryGuy, arguments);
};
var makeList = function () {
  return FactoryGuy.makeList.apply(FactoryGuy, arguments);
};
var build = function () {
  return FactoryGuy.build.apply(FactoryGuy, arguments);
};
var buildList = function () {
  return FactoryGuy.buildList.apply(FactoryGuy, arguments);
};
var clearStore = function () {
  return FactoryGuy.clearStore.apply(FactoryGuy, arguments);
};

export { make, makeList, build, buildList, clearStore };
export default FactoryGuy;
