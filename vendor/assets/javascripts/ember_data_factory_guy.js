var Sequence = function (fn) {
  var index = 1;
  this.next = function () {
    return fn.call(this, index++);
  };
  this.reset = function () {
    index = 1;
  };
};

var MissingSequenceError = function(message) {
  this.toString = function () {
    return message;
  };
};

if (FactoryGuy !== undefined) {
  FactoryGuy.sequence = Sequence;
  FactoryGuy.missingSequenceError = MissingSequenceError;
};

/**
 A ModelDefinition encapsulates a model's definition

 @param model
 @param config
 @constructor
 */
var ModelDefinition = function (model, config) {
  var sequences = {};
  var traits = {};
  var defaultAttributes = {};
  var namedModels = {};
  var modelId = 1;
  var sequenceName = null;
  this.model = model;
  /**
   @param {String} name model name like 'user' or named type like 'admin'
   @returns {Boolean} true if name is this definitions model or this definition
   contains a named model with that name
   */
  this.matchesName = function (name) {
    return model == name || namedModels[name];
  };
  // Increment id
  this.nextId = function () {
    return modelId++;
  };
  /**
   Call the next method on the named sequence function. If the name
   is a function, create the sequence with that function

   @param   {String} name previously declared sequence name or
            an the random name generate for inline functions
   @param   {Function} sequenceFn optional function to use as sequence
   @returns {String} output of sequence function
   */
  this.generate = function (name, sequenceFn) {
    if (sequenceFn) {
      if (!sequences[name]) {
        // create and add that sequence function on the fly
        sequences[name] = new Sequence(sequenceFn);
      }
    }
    var sequence = sequences[name];
    if (!sequence) {
      throw new MissingSequenceError('Can not find that sequence named [' + sequenceName + '] in \'' + model + '\' definition');
    }
    return sequence.next();
  };
  /**
   Build a fixture by name

   @param {String} name fixture name
   @param {Object} opts attributes to override
   @param {String} traitArgs array of traits
   @returns {Object} json
   */
  this.build = function (name, opts, traitArgs) {
    var traitsObj = {};
    traitArgs.forEach(function (trait) {
      $.extend(traitsObj, traits[trait]);
    });
    var modelAttributes = namedModels[name] || {};
    // merge default, modelAttributes, traits and opts to get the rough fixture
    var fixture = $.extend({}, defaultAttributes, modelAttributes, traitsObj, opts);
    // deal with attributes that are functions or objects
    for (var attribute in fixture) {
      if (Ember.typeOf(fixture[attribute]) == 'function') {
        // function might be a sequence of a named association
        fixture[attribute] = fixture[attribute].call(this, fixture);
      } else if (Ember.typeOf(fixture[attribute]) == 'object') {
        // If it's an object and it's a model association attribute, build the json
        // for the association and replace the attribute with that json
        if (FactoryGuy.getStore()) {
          if (FactoryGuy.isAttributeRelationship(this.model, attribute)) {
            fixture[attribute] = FactoryGuy.build(attribute, fixture[attribute]);
          }
        } else {
          // For legacy reasons, if the store is not set in FactoryGuy, keep
          // this code the way it is ( though it will cause failures when the object is actually
          // a custom attribute and not a relationship ), while users start setting the store
          // in FactoryGuy, or using testHelper.make instead of store.makeFixture
          fixture[attribute] = FactoryGuy.build(attribute, fixture[attribute]);
        }
      }
    }
    // set the id, unless it was already set in opts
    if (!fixture.id) {
      fixture.id = this.nextId();
    }
    return fixture;
  };
  /**
   Build a list of fixtures

   @param {String} name model name or named model type
   @param {Integer} number of fixtures to build
   @param {Array} array of traits to build with
   @param {Object} opts attribute options
   @returns array of fixtures
   */
  this.buildList = function (name, number, traits, opts) {
    var arr = [];
    for (var i = 0; i < number; i++) {
      arr.push(this.build(name, opts, traits));
    }
    return arr;
  };
  // Set the modelId back to 1, and reset the sequences
  this.reset = function () {
    modelId = 1;
    for (var name in sequences) {
      sequences[name].reset();
    }
  };
  var parseDefault = function (object) {
    if (!object) {
      return;
    }
    defaultAttributes = object;
  };
  var parseTraits = function (object) {
    if (!object) {
      return;
    }
    traits = object;
  };
  var parseSequences = function (object) {
    if (!object) {
      return;
    }
    for (sequenceName in object) {
      var sequenceFn = object[sequenceName];
      if (Ember.typeOf(sequenceFn) != 'function') {
        throw new Error('Problem with [' + sequenceName + '] sequence definition. Sequences must be functions');
      }
      object[sequenceName] = new Sequence(sequenceFn);
    }
    sequences = object;
  };
  var parseConfig = function (config) {
    parseSequences(config.sequences);
    delete config.sequences;
    parseTraits(config.traits);
    delete config.traits;
    parseDefault(config.default);
    delete config.default;
    namedModels = config;
  };
  // initialize
  parseConfig(config);
};

if (FactoryGuy !== undefined) {
  FactoryGuy.modelDefiniton = ModelDefinition;
};

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
    if (this.modelDefinitions[model]) {
      this.modelDefinitions[model].merge(config);
    } else {
      this.modelDefinitions[model] = new ModelDefinition(model, config);
    }
  },
  /**
   Setting the store so FactoryGuy can do some model introspection.
   */
   setStore: function(store) {
    Ember.assert("FactoryGuy#setStore needs a valid store instance.You passed in ["+store+"]",store instanceof DS.Store)
    this.store = store;
  },
  getStore: function() {
    return this.store;
  },
  /**
   Checks a model's attribute to determine if it's a relationship.

   @param {String} typeName  model type name like 'user' for User model class
   @param {String} attribute  attribute you want to check
   @returns {Boolean} true if the attribute is a relationship, false if not
   */
  isAttributeRelationship: function(typeName, attribute) {
    if (!this.store) {
      Ember.debug("FactoryGuy does not have the application's store. Use FactoryGuy.setStore(store) before making any fixtures")
      // The legacy value was true.
      return true;
    }
    var model = this.store.modelFor(typeName);
    return !!model.typeForRelationship(attribute);
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
      if (Em.typeOf(nameOrFunction) == 'function') {
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
    var args = Array.prototype.slice.call(arguments);
    var opts = {};
    var name = args.shift();
    if (!name) {
      throw new Error('Build needs a factory name to build');
    }
    if (Ember.typeOf(args[args.length - 1]) == 'object') {
      opts = args.pop();
    }
    var traits = args;
    // whatever is left are traits
    var definition = this.lookupDefinitionForFixtureName(name);
    if (!definition) {
      throw new Error('Can\'t find that factory named [' + name + ']');
    }
    return definition.build(name, opts, traits);
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
    if (Ember.typeOf(args[args.length - 1]) == 'object') {
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
  make: function() {
    var store = this.store;
    Ember.assert("FactoryGuy does not have the application's store. Use FactoryGuy.setStore(store) before making any fixtures", store);

    var fixture = this.build.apply(this, arguments);
    var name = arguments[0];
    var modelName = this.lookupModelForFixtureName(name);
    var modelType = store.modelFor(modelName);

    if (store.usingFixtureAdapter()) {
      store.setAssociationsForFixtureAdapter(modelType, modelName, fixture);
      fixture = FactoryGuy.pushFixture(modelType, fixture);
      store.loadModelForFixtureAdapter(modelType, fixture);
      return fixture;
    } else {
      return store.makeModel(modelType, fixture);
    }
  },
  /**
   Make a list of Fixtures

   @param {String} name name of fixture
   @param {Number} number number to create
   @param {String} trait  optional trait names ( one or more )
   @param {Object} options  optional fixture options that will override default fixture values
   @returns {Array} list of json fixtures or records depending on the adapter type
   */
  makeList: function() {
    Ember.assert("FactoryGuy does not have the application's store. Use FactoryGuy.setStore(store) before making any fixtures", this.store);

    var arr = [];
    var args = Array.prototype.slice.call(arguments);
    Ember.assert("makeList needs at least 2 arguments, a name and a number",args.length >= 2);
    var number = args.splice(1,1)[0];
    Ember.assert("Second argument to makeList should be a number (of fixtures to make.)",typeof number == 'number');

    for (var i = 0; i < number; i++) {
      arr.push(this.make.apply(this, args));
    }
    return arr;
  },
  /**
   Clear model instances from FIXTURES array, and from store cache.
   Reset the id sequence for the models back to zero.
  */
  resetModels: function (store) {
    for (var model in this.modelDefinitions) {
      var definition = this.modelDefinitions[model];
      definition.reset();
      try {
        var modelType = store.modelFor(definition.model);
        if (store.usingFixtureAdapter()) {
          modelType.FIXTURES = [];
        }
        store.unloadAll(modelType);
      } catch (e) {
        console.log('resetModels',e)
      }
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
  indexOfFixture: function(fixtures, fixture) {
    var index = -1,
        id = fixture.id + '';
    Ember.A(fixtures).find(function(r, i) {
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
  clear: function (opts) {
    if (!opts) {
      this.modelDefinitions = {};
    }
  }
};

var MockCreateRequest = function(url, store, modelName, options) {
  var succeed = options.succeed === undefined ? true : options.succeed;
  var matchArgs = options.match;
  var returnArgs = options.returns;
  var responseJson = {};
  var expectedRequest = {};
  var modelType = store.modelFor(modelName);

  this.calculate = function() {
    if (matchArgs) {
      var tmpRecord = store.createRecord(modelName, matchArgs);
      expectedRequest = tmpRecord.serialize(matchArgs);
      tmpRecord.deleteRecord();
    }

    if (succeed) {
      var definition = FactoryGuy.modelDefinitions[modelName];
      if (responseJson[modelName]) {
        // already calculated once, keep the same id
        responseJson[modelName] = $.extend({id: responseJson[modelName].id}, matchArgs, returnArgs);
      } else {
        responseJson[modelName] = $.extend({id: definition.nextId()}, matchArgs, returnArgs);
      }
      // Remove belongsTo associations since they will already be set when you called
      // createRecord, so they don't need to be returned.
      Ember.get(modelType, 'relationshipsByName').forEach(function (relationship) {
        if (relationship.kind == 'belongsTo') {
          delete responseJson[modelName][relationship.key];
        }
      })
    }

  }

  this.match = function(matches) {
    matchArgs = matches;
    this.calculate();
    return this;
  }

  this.andReturn = function(returns) {
    returnArgs = returns;
    this.calculate();
    return this;
  }

  this.andFail = function() {
    succeed = false;
    return this;
  }

  this.handler = function(settings) {
    if (settings.url != url || settings.type != 'POST') { return false}

    if (matchArgs) {
      var requestData = JSON.parse(settings.data)[modelName];
      var attribute;
      for (attribute in expectedRequest) {
        if (expectedRequest[attribute] &&
            requestData[attribute] != expectedRequest[attribute]) {
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

  this.calculate();

  $.mockjax(this.handler);
};

(function () {
  DS.Store.reopen({
    /**
     @returns {Boolean} true if store's adapter is DS.FixtureAdapter
     */
    usingFixtureAdapter: function () {
      var adapter = this.adapterFor('application');
      return adapter instanceof DS.FixtureAdapter;
    },
    /**
      Deprecated in favor of FactoryGuy.make
     */
    makeFixture: function () {
      Ember.deprecate('DEPRECATION Warning: use FactoryGuy.make instead');
      FactoryGuy.make.call(FactoryGuy, arguments)
    },
    /**
      Deprecated in favor of FactoryGuy.makeList
     */
    makeList: function () {
      Ember.deprecate('DEPRECATION Warning: use FactoryGuy.makeList instead');
      FactoryGuy.makeList.call(FactoryGuy, arguments)
    },
    /**
     * Most of the work of making the model from the json fixture is going on here.
     * @param modelType
     * @param fixture
     * @returns {DS.Model} instance of DS.Model
     */
    makeModel: function (modelType, fixture) {
      var store = this,
          modelName = store.modelFor(modelType).typeKey,
          model;

      Em.run(function () {
        store.findEmbeddedAssociationsForRESTAdapter(modelType, fixture);
        if (fixture.type) {
          // assuming its polymorphic if there is a type attribute
          // is this too bold an assumption?
          modelName = fixture.type.underscore();
          modelType = store.modelFor(modelName);
        }
        model = store.push(modelName, fixture);
        store.setAssociationsForRESTAdapter(modelType, modelName, model);
      });
      return model;
    },
    /**
     Set the hasMany and belongsTo associations for FixtureAdapter.

     For example, assuming a user hasMany projects, if you make a project,
     then a user with that project in the users list of project, then this method
     will go back and set the user.id on each project that the user hasMany of,
     so that the project now has the belongsTo user association setup.
     As in this scenario:

     ```js
     var projectJson = store.makeFixture('project');
     var userJson = store.makeFixture('user', {projects: [projectJson]});
     ```

     Or if you make a project with a user, then set this project in
     the users list of 'projects' it hasMany of. As in this scenario:

     ```js
     var userJson = store.makeFixture('user');
     var projectJson = store.makeFixture('project', {user: userJson});
     ```

     @param {DS.Model} modelType model type like User
     @param {String} modelName model name like 'user'
     @param {Object} fixture to check for needed association assignments
     */
    setAssociationsForFixtureAdapter: function (modelType, modelName, fixture) {
      var self = this;
      var adapter = this.adapterFor('application');

      Ember.get(modelType, 'relationshipsByName').forEach(function (relationship, name) {
        var hasManyRelation, belongsToRecord;
        if (relationship.kind == 'hasMany') {
          hasManyRelation = fixture[relationship.key];
          if (hasManyRelation) {
            $.each(fixture[relationship.key], function (index, object) {
              // used to require that the relationship was set by id,
              // but now, you can set it as the json object, and this will
              // normalize that back to the id
              var id = object;
              if (Ember.typeOf(object) == 'object') {
                FactoryGuy.pushFixture(relationship.type, object);
                id = object.id;
                hasManyRelation[index] = id;
              }
              var hasManyfixtures = adapter.fixturesForType(relationship.type);
              var hasManyFixture = adapter.findFixtureById(hasManyfixtures, id);
              hasManyFixture[modelName] = fixture.id;
              self.loadModelForFixtureAdapter(relationship.type, hasManyFixture);
            });
          }
        }
        if (relationship.kind == 'belongsTo') {
          belongsToRecord = fixture[relationship.key];
          if (belongsToRecord) {
            if (typeof belongsToRecord == 'object') {
              FactoryGuy.pushFixture(relationship.type, belongsToRecord);
              fixture[relationship.key] = belongsToRecord.id;
            }
            var hasManyName = self.findHasManyRelationshipNameForFixtureAdapter(relationship.type, relationship.parentType);
            var belongsToFixtures = adapter.fixturesForType(relationship.type);
            var belongsTofixture = adapter.findFixtureById(belongsToFixtures, fixture[relationship.key]);
            if (!belongsTofixture[hasManyName]) {
              belongsTofixture[hasManyName] = [];
            }
            belongsTofixture[hasManyName].push(fixture.id);
            self.loadModelForFixtureAdapter(relationship.type, belongsTofixture);
          }
        }
      });
    },

    loadModelForFixtureAdapter: function(modelType, fixture) {
      var storeModel = this.getById(modelType, fixture.id),
          that = this;
      if (!Ember.isPresent(storeModel) || storeModel.get('isEmpty')) {
        Ember.run(function () {
          var dup = Ember.copy(fixture, true);
          that.push(modelType, fixture);
          //replace relationships back to ids instead of built ember objects
          Ember.get(modelType, 'relationshipsByName').forEach(function (relationship, name) {
            if(fixture[relationship.key]) {
              fixture[relationship.key] = dup[relationship.key];
            }
          });
        });
      }
    },

    /**
     Before pushing the fixture to the store, do some preprocessing. Descend into the tree
     of object data, and convert child objects to record instances recursively.

     If its a belongs to association, and the fixture has an object there,
     then push that model to the store and set the id of that new model
     as the attribute value in the fixture

     @param modelType
     @param fixture
     */
    findEmbeddedAssociationsForRESTAdapter: function (modelType, fixture) {
      var store = this;
      Ember.get(modelType, 'relationshipsByName').forEach(function (relationship, name) {
        if (relationship.kind == 'belongsTo') {
          var belongsToRecord = fixture[relationship.key];
          if (Ember.typeOf(belongsToRecord) == 'object') {
            store.findEmbeddedAssociationsForRESTAdapter(relationship.type, belongsToRecord);
            belongsToRecord = store.push(relationship.type, belongsToRecord);
            fixture[relationship.key] = belongsToRecord;
          }
        }
        if (relationship.kind == 'hasMany') {
          var hasManyRecords = fixture[relationship.key];
          if (Ember.typeOf(hasManyRecords) == 'array') {
            if (Ember.typeOf(hasManyRecords[0]) == 'object') {
              var records = Em.A();
              hasManyRecords.map(function (object) {
                store.findEmbeddedAssociationsForRESTAdapter(relationship.type, object);
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
     For the REST type models:

     For example if a user hasMany projects, then set the user
     on each project that the user hasMany of, so that the project
     now has the belongsTo user association setup. As in this scenario:

     ```js
     var project = store.makeFixture('project');
     var user = store.makeFixture('user', {projects: [project]});
     ```

     Or if you make a user, then a project with that user, then set the project
     in the users list of 'projects' it hasMany of. As in this scenario:

     ```js
     var user = store.makeFixture('user');
     var project = store.makeFixture('project', {user: user});
     ```

     NOTE:
     As of ember-data-1.0.0-beta.10 and ember-data-1.0.0-beta.12,
     this method is only needed because the belongsTo is not assigned when
     there is a self referential polymorphic has many association.

     @param {DS.Model} modelType model type like 'User'
     @param {String} modelName model name like 'user'
     @param {DS.Model} model model to check for needed association assignments
     */
    setAssociationsForRESTAdapter: function (modelType, modelName, model) {
      var self = this;
      Ember.get(modelType, 'relationshipsByName').forEach(function (relationship, name) {
        if (relationship.kind == 'hasMany') {
          var children = model.get(name) || [];
          children.forEach(function (child) {
            var belongsToName = self.findRelationshipName('belongsTo', child.constructor, model);
            if (belongsToName) {
              child.set(belongsToName, model);
            }
          });
        }
      });
    },
    findRelationshipName: function (kind, belongToModelType, childModel) {
      var relationshipName;
      Ember.get(belongToModelType, 'relationshipsByName').forEach(function (relationship, name) {
        if (relationship.kind == kind && childModel instanceof relationship.type) {
          relationshipName = relationship.key;
        }
      });
      return relationshipName;
    },
    findHasManyRelationshipNameForFixtureAdapter: function (belongToModelType, childModelType) {
      var relationshipName;
      Ember.get(belongToModelType, 'relationshipsByName').forEach(function (relationship, name) {
        if (relationship.kind == 'hasMany' && childModelType == relationship.type) {
          relationshipName = relationship.key;
        }
      });
      return relationshipName;
    },
    /**
     Adding a pushPayload for FixtureAdapter, but using the original with
     other adapters that support pushPayload.

     @param {String} type
     @param {Object} payload
     */
    pushPayload: function (type, payload) {
      var typeName, model;

      if (this.usingFixtureAdapter()) {
        if (Ember.typeOf(type) === 'string' && Ember.isPresent(payload) && Ember.isPresent(payload.id)){
          //pushPayload('user', {id:..})
          model = this.modelFor(type);
          FactoryGuy.pushFixture(model, payload);
          this.push(model, Ember.copy(payload, true));
        } else if(Ember.typeOf(type) === 'object' || Ember.typeOf(payload) === 'object') {
          //pushPayload({users: {id:..}}) OR pushPayload('user', {users: {id:..}})
          if(Ember.isBlank(payload)){
            payload = type;
          }

          for (var prop in payload) {
            typeName = Ember.String.camelize(Ember.String.singularize(prop));
            model = this.modelFor(typeName);

            this.pushMany(model, Ember.makeArray( Ember.copy(payload[prop], true) ));
            Ember.ArrayPolyfills.forEach.call(Ember.makeArray(payload[prop]), function(hash) {
              FactoryGuy.pushFixture(model, hash);
            }, this);
          }
        } else {
          throw new Ember.Error('Assertion Failed: You cannot use `store#pushPayload` with this method signature pushPayload(' + type + ',' + payload + ')');
        }
      } else {
        this._super(type, payload);
      }
    }
  });
})();

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
   Map many json objects to response json.

   Allows custom serializing mappings and meta data to be added to requests.

   @param {String} modelName model name
   @param {Object} json Json objects from records.map
   @return {Object} responseJson
  */
  mapFindAll: function(modelName, json) {
    var responseJson = {};
    responseJson[modelName.pluralize()] = json;
    return responseJson;
  },
  /**
   Map single object to response json.

   Allows custom serializing mappings and meta data to be added to requests.

   @param {String} modelName model name
   @param {Object} json Json object from record.toJSON
   @return {Object} responseJson
  */
  mapFind:function(modelName, json){
    var responseJson = {};
    responseJson[modelName.pluralize()] = json;
    return responseJson;
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
    var json = records.map(function(record) {return record.toJSON({includeId: true})});
    var responseJson = this.mapFindAll(modelName, json);
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

    var json = record.toJSON({includeId: true});
    var responseJson = this.mapFind(modelName, json);
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
    var responseJson = this.mapFindAll(modelName, json);
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
    var url = this.buildURL(modelName);
    var store = this.getStore();
    var opts = options === undefined ? {} : options;
    return new MockCreateRequest(url, store, modelName, opts);
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

/*!
 * MockJax - jQuery Plugin to Mock Ajax requests
 *
 * Version:  1.6.1
 * Released:
 * Home:   https://github.com/jakerella/jquery-mockjax
 * Author:   Jonathan Sharp (http://jdsharp.com)
 * License:  MIT,GPL
 *
 * Copyright (c) 2014 appendTo, Jordan Kasper
 * NOTE: This repository was taken over by Jordan Kasper (@jakerella) October, 2014
 * 
 * Dual licensed under the MIT or GPL licenses.
 * http://opensource.org/licenses/MIT OR http://www.gnu.org/licenses/gpl-2.0.html
 */
(function($) {
	var _ajax = $.ajax,
		mockHandlers = [],
		mockedAjaxCalls = [],
		unmockedAjaxCalls = [],
		CALLBACK_REGEX = /=\?(&|$)/,
		jsc = (new Date()).getTime();


	// Parse the given XML string.
	function parseXML(xml) {
		if ( window.DOMParser == undefined && window.ActiveXObject ) {
			DOMParser = function() { };
			DOMParser.prototype.parseFromString = function( xmlString ) {
				var doc = new ActiveXObject('Microsoft.XMLDOM');
				doc.async = 'false';
				doc.loadXML( xmlString );
				return doc;
			};
		}

		try {
			var xmlDoc = ( new DOMParser() ).parseFromString( xml, 'text/xml' );
			if ( $.isXMLDoc( xmlDoc ) ) {
				var err = $('parsererror', xmlDoc);
				if ( err.length == 1 ) {
					throw new Error('Error: ' + $(xmlDoc).text() );
				}
			} else {
				throw new Error('Unable to parse XML');
			}
			return xmlDoc;
		} catch( e ) {
			var msg = ( e.name == undefined ? e : e.name + ': ' + e.message );
			$(document).trigger('xmlParseError', [ msg ]);
			return undefined;
		}
	}

	// Check if the data field on the mock handler and the request match. This
	// can be used to restrict a mock handler to being used only when a certain
	// set of data is passed to it.
	function isMockDataEqual( mock, live ) {
		var identical = true;
		// Test for situations where the data is a querystring (not an object)
		if (typeof live === 'string') {
			// Querystring may be a regex
			return $.isFunction( mock.test ) ? mock.test(live) : mock == live;
		}
		$.each(mock, function(k) {
			if ( live[k] === undefined ) {
				identical = false;
				return identical;
			} else {
				if ( typeof live[k] === 'object' && live[k] !== null ) {
					if ( identical && $.isArray( live[k] ) ) {
						identical = $.isArray( mock[k] ) && live[k].length === mock[k].length;
					}
					identical = identical && isMockDataEqual(mock[k], live[k]);
				} else {
					if ( mock[k] && $.isFunction( mock[k].test ) ) {
						identical = identical && mock[k].test(live[k]);
					} else {
						identical = identical && ( mock[k] == live[k] );
					}
				}
			}
		});

		return identical;
	}

    // See if a mock handler property matches the default settings
    function isDefaultSetting(handler, property) {
        return handler[property] === $.mockjaxSettings[property];
    }

	// Check the given handler should mock the given request
	function getMockForRequest( handler, requestSettings ) {
		// If the mock was registered with a function, let the function decide if we
		// want to mock this request
		if ( $.isFunction(handler) ) {
			return handler( requestSettings );
		}

		// Inspect the URL of the request and check if the mock handler's url
		// matches the url for this ajax request
		if ( $.isFunction(handler.url.test) ) {
			// The user provided a regex for the url, test it
			if ( !handler.url.test( requestSettings.url ) ) {
				return null;
			}
		} else {
			// Look for a simple wildcard '*' or a direct URL match
			var star = handler.url.indexOf('*');
			if (handler.url !== requestSettings.url && star === -1 ||
					!new RegExp(handler.url.replace(/[-[\]{}()+?.,\\^$|#\s]/g, "\\$&").replace(/\*/g, '.+')).test(requestSettings.url)) {
				return null;
			}
		}

		// Inspect the data submitted in the request (either POST body or GET query string)
		if ( handler.data ) {
			if ( ! requestSettings.data || !isMockDataEqual(handler.data, requestSettings.data) ) {
				// They're not identical, do not mock this request
				return null;
			}
		}
		// Inspect the request type
		if ( handler && handler.type &&
				handler.type.toLowerCase() != requestSettings.type.toLowerCase() ) {
			// The request type doesn't match (GET vs. POST)
			return null;
		}

		return handler;
	}

	function parseResponseTimeOpt(responseTime) {
		if ($.isArray(responseTime)) {
			var min = responseTime[0];
			var max = responseTime[1];
			return (typeof min === 'number' && typeof max === 'number') ? Math.floor(Math.random() * (max - min)) + min : null;
		} else {
			return (typeof responseTime === 'number') ? responseTime: null;
		}
	}

	// Process the xhr objects send operation
	function _xhrSend(mockHandler, requestSettings, origSettings) {

		// This is a substitute for < 1.4 which lacks $.proxy
		var process = (function(that) {
			return function() {
				return (function() {
					// The request has returned
					this.status     = mockHandler.status;
					this.statusText = mockHandler.statusText;
					this.readyState	= 1;

					var finishRequest = function () {
						this.readyState	= 4;

						var onReady;
						// Copy over our mock to our xhr object before passing control back to
						// jQuery's onreadystatechange callback
						if ( requestSettings.dataType == 'json' && ( typeof mockHandler.responseText == 'object' ) ) {
							this.responseText = JSON.stringify(mockHandler.responseText);
						} else if ( requestSettings.dataType == 'xml' ) {
							if ( typeof mockHandler.responseXML == 'string' ) {
								this.responseXML = parseXML(mockHandler.responseXML);
								//in jQuery 1.9.1+, responseXML is processed differently and relies on responseText
								this.responseText = mockHandler.responseXML;
							} else {
								this.responseXML = mockHandler.responseXML;
							}
						} else if (typeof mockHandler.responseText === 'object' && mockHandler.responseText !== null) {
							// since jQuery 1.9 responseText type has to match contentType
							mockHandler.contentType = 'application/json';
							this.responseText = JSON.stringify(mockHandler.responseText);
						} else {
							this.responseText = mockHandler.responseText;
						}
						if( typeof mockHandler.status == 'number' || typeof mockHandler.status == 'string' ) {
							this.status = mockHandler.status;
						}
						if( typeof mockHandler.statusText === "string") {
							this.statusText = mockHandler.statusText;
						}
						// jQuery 2.0 renamed onreadystatechange to onload
						onReady = this.onreadystatechange || this.onload;

						// jQuery < 1.4 doesn't have onreadystate change for xhr
						if ( $.isFunction( onReady ) ) {
							if( mockHandler.isTimeout) {
								this.status = -1;
							}
							onReady.call( this, mockHandler.isTimeout ? 'timeout' : undefined );
						} else if ( mockHandler.isTimeout ) {
							// Fix for 1.3.2 timeout to keep success from firing.
							this.status = -1;
						}
					};

					// We have an executable function, call it to give
					// the mock handler a chance to update it's data
					if ( $.isFunction(mockHandler.response) ) {
						// Wait for it to finish
						if ( mockHandler.response.length === 2 ) {
							mockHandler.response(origSettings, function () {
								finishRequest.call(that);
							});
							return;
						} else {
							mockHandler.response(origSettings);
						}
					}

					finishRequest.call(that);
				}).apply(that);
			};
		})(this);

		if ( mockHandler.proxy ) {
			// We're proxying this request and loading in an external file instead
			_ajax({
				global: false,
				url: mockHandler.proxy,
				type: mockHandler.proxyType,
				data: mockHandler.data,
				dataType: requestSettings.dataType === "script" ? "text/plain" : requestSettings.dataType,
				complete: function(xhr) {
					mockHandler.responseXML = xhr.responseXML;
					mockHandler.responseText = xhr.responseText;
                    // Don't override the handler status/statusText if it's specified by the config
                    if (isDefaultSetting(mockHandler, 'status')) {
					    mockHandler.status = xhr.status;
                    }
                    if (isDefaultSetting(mockHandler, 'statusText')) {
					    mockHandler.statusText = xhr.statusText;
                    }
					this.responseTimer = setTimeout(process, parseResponseTimeOpt(mockHandler.responseTime) || 0);
				}
			});
		} else {
			// type == 'POST' || 'GET' || 'DELETE'
			if ( requestSettings.async === false ) {
				// TODO: Blocking delay
				process();
			} else {
				this.responseTimer = setTimeout(process, parseResponseTimeOpt(mockHandler.responseTime) || 50);
			}
		}
	}

	// Construct a mocked XHR Object
	function xhr(mockHandler, requestSettings, origSettings, origHandler) {
		// Extend with our default mockjax settings
		mockHandler = $.extend(true, {}, $.mockjaxSettings, mockHandler);

		if (typeof mockHandler.headers === 'undefined') {
			mockHandler.headers = {};
		}
		if (typeof requestSettings.headers === 'undefined') {
			requestSettings.headers = {};
		}
		if ( mockHandler.contentType ) {
			mockHandler.headers['content-type'] = mockHandler.contentType;
		}

		return {
			status: mockHandler.status,
			statusText: mockHandler.statusText,
			readyState: 1,
			open: function() { },
			send: function() {
				origHandler.fired = true;
				_xhrSend.call(this, mockHandler, requestSettings, origSettings);
			},
			abort: function() {
				clearTimeout(this.responseTimer);
			},
			setRequestHeader: function(header, value) {
				requestSettings.headers[header] = value;
			},
			getResponseHeader: function(header) {
				// 'Last-modified', 'Etag', 'content-type' are all checked by jQuery
				if ( mockHandler.headers && mockHandler.headers[header] ) {
					// Return arbitrary headers
					return mockHandler.headers[header];
				} else if ( header.toLowerCase() == 'last-modified' ) {
					return mockHandler.lastModified || (new Date()).toString();
				} else if ( header.toLowerCase() == 'etag' ) {
					return mockHandler.etag || '';
				} else if ( header.toLowerCase() == 'content-type' ) {
					return mockHandler.contentType || 'text/plain';
				}
			},
			getAllResponseHeaders: function() {
				var headers = '';
				// since jQuery 1.9 responseText type has to match contentType
				if (mockHandler.contentType) {
					mockHandler.headers['Content-Type'] = mockHandler.contentType;
				}
				$.each(mockHandler.headers, function(k, v) {
					headers += k + ': ' + v + "\n";
				});
				return headers;
			}
		};
	}

	// Process a JSONP mock request.
	function processJsonpMock( requestSettings, mockHandler, origSettings ) {
		// Handle JSONP Parameter Callbacks, we need to replicate some of the jQuery core here
		// because there isn't an easy hook for the cross domain script tag of jsonp

		processJsonpUrl( requestSettings );

		requestSettings.dataType = "json";
		if(requestSettings.data && CALLBACK_REGEX.test(requestSettings.data) || CALLBACK_REGEX.test(requestSettings.url)) {
			createJsonpCallback(requestSettings, mockHandler, origSettings);

			// We need to make sure
			// that a JSONP style response is executed properly

			var rurl = /^(\w+:)?\/\/([^\/?#]+)/,
				parts = rurl.exec( requestSettings.url ),
				remote = parts && (parts[1] && parts[1] !== location.protocol || parts[2] !== location.host);

			requestSettings.dataType = "script";
			if(requestSettings.type.toUpperCase() === "GET" && remote ) {
				var newMockReturn = processJsonpRequest( requestSettings, mockHandler, origSettings );

				// Check if we are supposed to return a Deferred back to the mock call, or just
				// signal success
				if(newMockReturn) {
					return newMockReturn;
				} else {
					return true;
				}
			}
		}
		return null;
	}

	// Append the required callback parameter to the end of the request URL, for a JSONP request
	function processJsonpUrl( requestSettings ) {
		if ( requestSettings.type.toUpperCase() === "GET" ) {
			if ( !CALLBACK_REGEX.test( requestSettings.url ) ) {
				requestSettings.url += (/\?/.test( requestSettings.url ) ? "&" : "?") +
					(requestSettings.jsonp || "callback") + "=?";
			}
		} else if ( !requestSettings.data || !CALLBACK_REGEX.test(requestSettings.data) ) {
			requestSettings.data = (requestSettings.data ? requestSettings.data + "&" : "") + (requestSettings.jsonp || "callback") + "=?";
		}
	}

	// Process a JSONP request by evaluating the mocked response text
	function processJsonpRequest( requestSettings, mockHandler, origSettings ) {
		// Synthesize the mock request for adding a script tag
		var callbackContext = origSettings && origSettings.context || requestSettings,
			newMock = null;


		// If the response handler on the moock is a function, call it
		if ( mockHandler.response && $.isFunction(mockHandler.response) ) {
			mockHandler.response(origSettings);
		} else {

			// Evaluate the responseText javascript in a global context
			if( typeof mockHandler.responseText === 'object' ) {
				$.globalEval( '(' + JSON.stringify( mockHandler.responseText ) + ')');
			} else {
				$.globalEval( '(' + mockHandler.responseText + ')');
			}
		}

		// Successful response
		setTimeout(function() {
			jsonpSuccess( requestSettings, callbackContext, mockHandler );
			jsonpComplete( requestSettings, callbackContext, mockHandler );
		}, parseResponseTimeOpt(mockHandler.responseTime) || 0);

		// If we are running under jQuery 1.5+, return a deferred object
		if($.Deferred){
			newMock = new $.Deferred();
			if(typeof mockHandler.responseText == "object"){
				newMock.resolveWith( callbackContext, [mockHandler.responseText] );
			}
			else{
				newMock.resolveWith( callbackContext, [$.parseJSON( mockHandler.responseText )] );
			}
		}
		return newMock;
	}


	// Create the required JSONP callback function for the request
	function createJsonpCallback( requestSettings, mockHandler, origSettings ) {
		var callbackContext = origSettings && origSettings.context || requestSettings;
		var jsonp = requestSettings.jsonpCallback || ("jsonp" + jsc++);

		// Replace the =? sequence both in the query string and the data
		if ( requestSettings.data ) {
			requestSettings.data = (requestSettings.data + "").replace(CALLBACK_REGEX, "=" + jsonp + "$1");
		}

		requestSettings.url = requestSettings.url.replace(CALLBACK_REGEX, "=" + jsonp + "$1");


		// Handle JSONP-style loading
		window[ jsonp ] = window[ jsonp ] || function( tmp ) {
			data = tmp;
			jsonpSuccess( requestSettings, callbackContext, mockHandler );
			jsonpComplete( requestSettings, callbackContext, mockHandler );
			// Garbage collect
			window[ jsonp ] = undefined;

			try {
				delete window[ jsonp ];
			} catch(e) {}

			if ( head ) {
				head.removeChild( script );
			}
		};
	}

	// The JSONP request was successful
	function jsonpSuccess(requestSettings, callbackContext, mockHandler) {
		// If a local callback was specified, fire it and pass it the data
		if ( requestSettings.success ) {
			requestSettings.success.call( callbackContext, mockHandler.responseText || "", status, {} );
		}

		// Fire the global callback
		if ( requestSettings.global ) {
			(requestSettings.context ? $(requestSettings.context) : $.event).trigger("ajaxSuccess", [{}, requestSettings]);
		}
	}

	// The JSONP request was completed
	function jsonpComplete(requestSettings, callbackContext) {
		// Process result
		if ( requestSettings.complete ) {
			requestSettings.complete.call( callbackContext, {} , status );
		}

		// The request was completed
		if ( requestSettings.global ) {
			(requestSettings.context ? $(requestSettings.context) : $.event).trigger("ajaxComplete", [{}, requestSettings]);
		}

		// Handle the global AJAX counter
		if ( requestSettings.global && ! --$.active ) {
			$.event.trigger( "ajaxStop" );
		}
	}


	// The core $.ajax replacement.
	function handleAjax( url, origSettings ) {
		var mockRequest, requestSettings, mockHandler, overrideCallback;

		// If url is an object, simulate pre-1.5 signature
		if ( typeof url === "object" ) {
			origSettings = url;
			url = undefined;
		} else {
			// work around to support 1.5 signature
			origSettings = origSettings || {};
			origSettings.url = url;
		}

		// Extend the original settings for the request
		requestSettings = $.extend(true, {}, $.ajaxSettings, origSettings);

		// Generic function to override callback methods for use with
		// callback options (onAfterSuccess, onAfterError, onAfterComplete)
		overrideCallback = function(action, mockHandler) {
			var origHandler = origSettings[action.toLowerCase()];
			return function() {
				if ( $.isFunction(origHandler) ) {
					origHandler.apply(this, [].slice.call(arguments));
				}
				mockHandler['onAfter' + action]();
			};
		};

		// Iterate over our mock handlers (in registration order) until we find
		// one that is willing to intercept the request
		for(var k = 0; k < mockHandlers.length; k++) {
			if ( !mockHandlers[k] ) {
				continue;
			}

			mockHandler = getMockForRequest( mockHandlers[k], requestSettings );
			if(!mockHandler) {
				// No valid mock found for this request
				continue;
			}

			mockedAjaxCalls.push(requestSettings);

			// If logging is enabled, log the mock to the console
			$.mockjaxSettings.log( mockHandler, requestSettings );


			if ( requestSettings.dataType && requestSettings.dataType.toUpperCase() === 'JSONP' ) {
				if ((mockRequest = processJsonpMock( requestSettings, mockHandler, origSettings ))) {
					// This mock will handle the JSONP request
					return mockRequest;
				}
			}


			// Removed to fix #54 - keep the mocking data object intact
			//mockHandler.data = requestSettings.data;

			mockHandler.cache = requestSettings.cache;
			mockHandler.timeout = requestSettings.timeout;
			mockHandler.global = requestSettings.global;

			// In the case of a timeout, we just need to ensure
			// an actual jQuery timeout (That is, our reponse won't)
			// return faster than the timeout setting.
			if ( mockHandler.isTimeout ) {
				if ( mockHandler.responseTime > 1 ) {
					origSettings.timeout = mockHandler.responseTime - 1;
				} else {
					mockHandler.responseTime = 2;
					origSettings.timeout = 1;
				}
				mockHandler.isTimeout = false;
			}

			// Set up onAfter[X] callback functions
			if ( $.isFunction( mockHandler.onAfterSuccess ) ) {
				origSettings.success = overrideCallback('Success', mockHandler);
			}
			if ( $.isFunction( mockHandler.onAfterError ) ) {
				origSettings.error = overrideCallback('Error', mockHandler);
			}
			if ( $.isFunction( mockHandler.onAfterComplete ) ) {
				origSettings.complete = overrideCallback('Complete', mockHandler);
			}

			copyUrlParameters(mockHandler, origSettings);

			(function(mockHandler, requestSettings, origSettings, origHandler) {

				mockRequest = _ajax.call($, $.extend(true, {}, origSettings, {
					// Mock the XHR object
					xhr: function() { return xhr( mockHandler, requestSettings, origSettings, origHandler ); }
				}));
			})(mockHandler, requestSettings, origSettings, mockHandlers[k]);

			return mockRequest;
		}

		// We don't have a mock request
		unmockedAjaxCalls.push(origSettings);
		if($.mockjaxSettings.throwUnmocked === true) {
			throw new Error('AJAX not mocked: ' + origSettings.url);
		}
		else { // trigger a normal request
			return _ajax.apply($, [origSettings]);
		}
	}

	/**
	* Copies URL parameter values if they were captured by a regular expression
	* @param {Object} mockHandler
	* @param {Object} origSettings
	*/
	function copyUrlParameters(mockHandler, origSettings) {
		//parameters aren't captured if the URL isn't a RegExp
		if (!(mockHandler.url instanceof RegExp)) {
			return;
		}
		//if no URL params were defined on the handler, don't attempt a capture
		if (!mockHandler.hasOwnProperty('urlParams')) {
			return;
		}
		var captures = mockHandler.url.exec(origSettings.url);
		//the whole RegExp match is always the first value in the capture results
		if (captures.length === 1) {
			return;
		}
		captures.shift();
		//use handler params as keys and capture resuts as values
		var i = 0,
		capturesLength = captures.length,
		paramsLength = mockHandler.urlParams.length,
		//in case the number of params specified is less than actual captures
		maxIterations = Math.min(capturesLength, paramsLength),
		paramValues = {};
		for (i; i < maxIterations; i++) {
			var key = mockHandler.urlParams[i];
			paramValues[key] = captures[i];
		}
		origSettings.urlParams = paramValues;
	}


	// Public

	$.extend({
		ajax: handleAjax
	});

	$.mockjaxSettings = {
		//url:        null,
		//type:       'GET',
		log:          function( mockHandler, requestSettings ) {
			if ( mockHandler.logging === false ||
				 ( typeof mockHandler.logging === 'undefined' && $.mockjaxSettings.logging === false ) ) {
				return;
			}
			if ( window.console && console.log ) {
				var message = 'MOCK ' + requestSettings.type.toUpperCase() + ': ' + requestSettings.url;
				var request = $.extend({}, requestSettings);

				if (typeof console.log === 'function') {
					console.log(message, request);
				} else {
					try {
						console.log( message + ' ' + JSON.stringify(request) );
					} catch (e) {
						console.log(message);
					}
				}
			}
		},
		logging:       true,
		status:        200,
		statusText:    "OK",
		responseTime:  500,
		isTimeout:     false,
		throwUnmocked: false,
		contentType:   'text/plain',
		response:      '',
		responseText:  '',
		responseXML:   '',
		proxy:         '',
		proxyType:     'GET',

		lastModified:  null,
		etag:          '',
		headers: {
			etag: 'IJF@H#@923uf8023hFO@I#H#',
			'content-type' : 'text/plain'
		}
	};

	$.mockjax = function(settings) {
		var i = mockHandlers.length;
		mockHandlers[i] = settings;
		return i;
	};
	$.mockjax.clear = function(i) {
		if ( arguments.length == 1 ) {
			mockHandlers[i] = null;
		} else {
			mockHandlers = [];
		}
		mockedAjaxCalls = [];
		unmockedAjaxCalls = [];
	};
	// support older, deprecated version
	$.mockjaxClear = function(i) {
		window.console && window.console.warn && window.console.warn( 'DEPRECATED: The $.mockjaxClear() method has been deprecated in 1.6.0. Please use $.mockjax.clear() as the older function will be removed soon!' );
		$.mockjax.clear();
	};
	$.mockjax.handler = function(i) {
		if ( arguments.length == 1 ) {
			return mockHandlers[i];
		}
	};
	$.mockjax.mockedAjaxCalls = function() {
		return mockedAjaxCalls;
	};
	$.mockjax.unfiredHandlers = function() {
		var results = [];
		for (var i=0, len=mockHandlers.length; i<len; i++) {
			var handler = mockHandlers[i];
            if (handler !== null && !handler.fired) {
				results.push(handler);
			}
		}
		return results;
	};
	$.mockjax.unmockedAjaxCalls = function() {
		return unmockedAjaxCalls;
	};
})(jQuery);
