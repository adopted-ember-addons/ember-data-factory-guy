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
      return this.pushFixture(modelType, fixture);
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
     * @returns {*}
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
        if (relationship.kind == 'hasMany') {
          var hasManyRelation = fixture[relationship.key];
          if (hasManyRelation) {
            $.each(fixture[relationship.key], function (index, object) {
              // used to require that the relationship was set by id,
              // but now, you can set it as the json object, and this will
              // normalize that back to the id
              var id = object;
              if (Ember.typeOf(object) == 'object') {
                id = object.id;
                hasManyRelation[index] = id;
              }
              var hasManyfixtures = adapter.fixturesForType(relationship.type);
              var fixture = adapter.findFixtureById(hasManyfixtures, id);
              fixture[modelName] = fixture.id;
            });
          }
        }
        if (relationship.kind == 'belongsTo') {
          var belongsToRecord = fixture[relationship.key];
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
          }
        }
      });
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
      if (this.usingFixtureAdapter()) {
        var model = this.modelFor(type);
        FactoryGuy.pushFixture(model, payload);
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
     Handling ajax GET for finding all records for a type of model.
     You can mock failed find by passing in success argument as false.

   ```js
     // Pass in the parameters you would normally pass into FactoryGuy.makeList,
     // like fixture name, number of fixtures to make, and optional traits,
     // or fixture options
     testHelper.handleFindMany('user', 2, 'with_hats');

     store.find('user').then(function(users){

     });
   ```

     @param {String} name  name of the fixture ( or model ) to find
     @param {Number} number  number of fixtures to create
     @param {String} trait  optional traits (one or more)
     @param {Object} opts  optional fixture options
   */
  handleFindMany: function () {
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
  /**
   Handling ajax GET for finding all records for a type of model with query parameters.

          First variation = pass in model instances
   ```js

     // Create model instances
     var users = FactoryGuy.makeList('user', 2, 'with_hats');

     // Pass in the array of model instances as last argument
     testHelper.handleFindQuery('user', ['name', 'age'], users);

     store.findQuery('user', {name:'Bob', age: 10}}).then(function(userInstances){
        /// userInstances will be the same of the users that were passed in
     })
   ```

        Third variation - pass in nothing for last argument
   ```js
   // This simulates a query that returns no results
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
     1) that any attributes in match will be added to the response json automatically,
    so you don't need to include them in the returns hash as well.

     2) If you don't use match options for exact match, there will be no id returned to the model.
        The reason being, that this method purposely returns an empty hash response with a 'don't match'
        style handleCreate, because if the responseJson returns a non empty data hash ( with even only
        the id), this essentially empty hash of attributes will override ( and nullify ) all the attributes
        that set when you created the record.
     3) If you match on a belongsTo association, you don't have to include that in the
    returns hash.

   @param {String} modelName  name of model your creating like 'profile' for Profile
   @param {Object} options  hash of options for handling request
   */
  handleCreate: function (modelName, options) {
    var opts = options === undefined ? {} : options;
    var succeed = opts.succeed === undefined ? true : opts.succeed;
    var match = opts.match || {};
    var returnArgs = opts.returns || {};

    var url = this.buildURL(modelName);
    var definition = FactoryGuy.modelDefinitions[modelName];

    var httpOptions = {type: 'POST'};
    if (opts.match) {
      var expectedRequest = {};
      var record = this.getStore().createRecord(modelName, match);
      expectedRequest[modelName] = record.serialize();
      httpOptions.data = JSON.stringify(expectedRequest);
    }

    var modelType = this.getStore().modelFor(modelName)

    var responseJson = {};
    if (succeed) {
        responseJson[modelName] = $.extend({id: definition.nextId()}, match, returnArgs);
        // Remove belongsTo associations since they will already be set when you called
        // createRecord, and included them in those attributes
        Ember.get(modelType, 'relationshipsByName').forEach(function (relationship) {
          if (relationship.kind == 'belongsTo') {
            delete responseJson[modelName][relationship.key];
          }
        })
    } else {
      httpOptions.status = 500;
    }

    this.stubEndpointForHttpRequest(url, responseJson, httpOptions);
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
