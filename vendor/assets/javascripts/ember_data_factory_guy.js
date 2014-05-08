Sequence = function (fn) {
  var index = 1;

  this.next = function () {
    return fn.call(this, index++);
  }

  this.reset = function () {
    index = 1;
  }
};

function MissingSequenceError(message) {
  this.toString = function() { return message }
};

/**
 A ModelDefinition encapsulates a model's definition

 @param model
 @param config
 @constructor
 */
ModelDefinition = function (model, config) {
  var sequences = {};
  var defaultAttributes = {};
  var namedModels = {};
  var modelId = 1;
  this.model = model;

  /**
   @param {String} name model name like 'user' or named type like 'admin'
   @returns {Boolean} true if name is this definitions model or this definition
   contains a named model with that name
   */
  this.matchesName = function (name) {
    return model == name || namedModels[name];
  }

  // TODO
  this.merge = function (config) {
  }

  /**
   Call the next method on the named sequence function

   @param {String} sequenceName
   @returns {String} output of sequence function
   */
  this.generate = function (sequenceName) {
    var sequence = sequences[sequenceName];
    if (!sequence) {
      throw new MissingSequenceError("Can not find that sequence named [" + sequenceName + "] in '" + model + "' definition")
    }
    return sequence.next();
  }

  /**
   Build a fixture by name

   @param {String} name fixture name
   @param {Object} opts attributes to override
   @returns {Object} json
   */
  this.build = function (name, opts) {
    var modelAttributes = namedModels[name] || {};
    // merge default, modelAttributes and opts to get the rough fixture
    var fixture = $.extend({}, defaultAttributes, modelAttributes, opts);
    // convert attributes that are functions to strings
    for (attribute in fixture) {
      if (typeof fixture[attribute] == 'function') {
        fixture[attribute] = fixture[attribute].call(this, fixture);
      }
    }
    // set the id, unless it was already set in opts
    if (!fixture.id) {
      fixture.id = modelId++;
    }
    return fixture;
  }

  /**
   Build a list of fixtures

   @param name model name or named model type
   @param number of fixtures to build
   @param opts attribute options
   @returns array of fixtures
   */
  this.buildList = function (name, number, opts) {
    var arr = [];
    for (var i = 0; i < number; i++) {
      arr.push(this.build(name, opts))
    }
    return arr;
  }

  // Set the modelId back to 1, and reset the sequences
  this.reset = function () {
    modelId = 1;
    for (name in sequences) {
      sequences[name].reset();
    }
  }

  var parseDefault = function (object) {
    if (!object) {
      return
    }
    defaultAttributes = object;
  }

  var parseSequences = function (object) {
    if (!object) {
      return
    }
    for (sequenceName in object) {
      var sequenceFn = object[sequenceName];
      if (typeof sequenceFn != 'function') {
        throw new Error('Problem with [' + sequenceName + '] sequence definition. Sequences must be functions')
      }
      object[sequenceName] = new Sequence(sequenceFn);
    }
    sequences = object;
  }

  var parseConfig = function (config) {
    parseSequences(config.sequences);
    delete config.sequences;

    parseDefault(config.default);
    delete config.default;

    namedModels = config;
  }

  // initialize
  parseConfig(config);
}
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

   For the Person model, you can define named fixtures like 'dude' or
   just use 'person' and get default values.

   And to get those fixtures you would call them this way:

   FactoryGuy.build('dude') or FactoryGuy.build('person')

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

   @param   {String} sequenceName
   @returns {Function} wrapper function that is called by the model
            definition containing the sequence
   */
  generate: function (sequenceName) {
    return function () {
      return this.generate(sequenceName);
    }
  },

  /**
    Given a name like 'person' or 'dude' determine what model this name
    refers to. In this case it's 'person' for each one.

   @param {String} name a fixture name could be model name like 'person'
          or a named person in model definition like 'dude'
   @returns {String} model name associated with fixture name
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

   @param {String} name a fixture name could be model name like 'person'
          or a named person in model definition like 'dude'
   @returns {ModelDefinition} definition associated with model
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

   @param {String} name fixture name
   @param {Object} opts options that will override default fixture values
   @returns {Object} json fixture
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

   @param {String} name fixture name
   @param {Number} number number of fixtures to create
   @param {Object} opts options that will override default fixture values
   @returns {Array} list of fixtures
   */
  buildList: function (name, number, opts) {
    var definition = this.lookupDefinitionForName(name);
    if (!definition) {
      throw new Error("Can't find that factory named [" + name + "]");
    }
    return definition.buildList(name, number, opts);
  },

  /**
   TODO: This is kind of problematic right now .. needs work

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
    if (!modelClass['FIXTURES']) {
      modelClass['FIXTURES'] = [];
    }
    modelClass['FIXTURES'].push(fixture);
    return fixture;
  },

  /**
   Clears all model definitions
  */
  clear: function (opts) {
    if (!opts) {
      this.modelDefinitions = {};
      return;
    }
  }
}
DS.Store.reopen({
  /**
   @returns {Boolean} true if store's adapter is DS.FixtureAdapter
   */
  usingFixtureAdapter: function () {
    var adapter = this.adapterFor('application');
    return adapter instanceof DS.FixtureAdapter;
  },

  /**
   Make new fixture and save to store. If the store is using FixtureAdapter,
   will push to FIXTURE array, otherwise will use push method on adapter.

   @param {String} name name of fixture
   @param {Object} options fixture options
   @returns {Object|DS.Model} json or record depending on the adapter type
   */
  makeFixture: function (name, options) {
    var modelName = FactoryGuy.lookupModelForName(name);
    var fixture = FactoryGuy.build(name, options);
    var modelType = this.modelFor(modelName);

    if (this.usingFixtureAdapter()) {
      this.setBelongsToFixturesAdapter(modelType, modelName, fixture);
      return FactoryGuy.pushFixture(modelType, fixture);
    } else {
      var self = this;
      var model;
      Em.run(function () {
        model = self.push(modelName, fixture);
        self.setBelongsToRESTAdapter(modelType, modelName, model);
      });
      return model;
    }
  },

  /**
   Make a list of Fixtures

   @param {String} name name of fixture
   @param {Number} number number to create
   @param {Object} options fixture options
   @returns {Array} list of json fixtures or records depending on the adapter type
   */
  makeList: function (name, number, options) {
    var arr = [];
    for (var i = 0; i < number; i++) {
      arr.push(this.makeFixture(name, options))
    }
    return arr;
  },

  /**
   Set the belongsTo association for FixtureAdapter,
   with models that have a hasMany association.

   For example if a user hasMany projects, then set the user.id
   on each project that the user hasMany of, so that the project
   now has the belongsTo user association setup.

   @param {String} modelType model type like App.User
   @param {String} modelName model name like 'user'
   @param {Object} parentFixture parent to assign as belongTo
   */
  setBelongsToFixturesAdapter: function (modelType, modelName, parentFixture) {
    var store = this;
    var adapter = this.adapterFor('application');
    var relationShips = Ember.get(modelType, 'relationshipNames');
    if (relationShips.hasMany) {
      relationShips.hasMany.forEach(function (relationship) {
        var hasManyModel = store.modelFor(Em.String.singularize(relationship));
        if (parentFixture[relationship]) {
          parentFixture[relationship].forEach(function (id) {
            var hasManyfixtures = adapter.fixturesForType(hasManyModel);
            var fixture = adapter.findFixtureById(hasManyfixtures, id);
            fixture[modelName] = parentFixture.id;
          })
        }
      })
    }
  },

  /**
   For the REST type models:

   Set the belongsTo association with a hasMany association

   Set this model in the parent hasMany array this model belongsTo

   For example if a user hasMany projects, then set the user
   on each project that the user hasMany of, so that the project
   now has the belongsTo user association setup

   @param {DS.Model} modelType model type like 'User'
   @param {String} modelName model name like 'user'
   @param {DS.Model} model
   */
  setBelongsToRESTAdapter: function (modelType, modelName, model) {
    var self = this;
    Ember.get(modelType, 'relationshipsByName').forEach(function (name, relationship) {
      if (relationship.kind == 'hasMany') {
        var children = model.get(name) || [];
        children.forEach(function (child) {
          child.set(modelName, model)
        })
      }

      if (relationship.kind == 'belongsTo') {
        var belongsToRecord = model.get(name);
        if (belongsToRecord) {
          var hasManyName = self.findHasManyRelationshipName(belongsToRecord, model)
          belongsToRecord.get(hasManyName).addObject(model);
        }
      }
    })
  },

  findHasManyRelationshipName: function (belongToModel, childModel) {
    var relationshipName;
    Ember.get(belongToModel.constructor, 'relationshipsByName').forEach(
      function (name, relationship) {
        if (relationship.kind == 'hasMany' &&
          relationship.type == childModel.constructor) {
          relationshipName = relationship.key;
        }
      }
    )
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
      var model = this.modelFor(modelName);
      FactoryGuy.pushFixture(model, payload);
    } else {
      this._super(type, payload);
    }
  }
});


DS.FixtureAdapter.reopen({

  /**
   Overriding createRecord to add the record created to the
   hashMany records for all of the records that this record belongsTo.

   For example:

   If models are defined like so:

   User = DS.Model.extend({
       projects: DS.hasMany('project')
     })

   Project = DS.Model.extend({
       user: DS.belongsTo('user')
     })

   and you create a project record with a user defined:
    store.createRecord('project', {user: user})

   this method will take the new project created and add it to the user's 'projects'
   hasMany array.

   And a full code example:

   var userJson = store.makeFixture('user');

   store.find('user', userJson.id).then(function(user) {
       store.createRecord('project', {user: user}).save()
         .then( function(project) {
           // user.get('projects.length') == 1;
       })
     })

   @method createRecord
   @param {DS.Store} store
   @param {subclass of DS.Model} type
   @param {DS.Model} record
   @return {Promise} promise
   */
  createRecord: function (store, type, record) {
    var promise = this._super(store, type, record);

    promise.then(function () {
      var relationShips = Ember.get(type, 'relationshipNames');
      if (relationShips.belongsTo) {
        relationShips.belongsTo.forEach(function (relationship) {
          var belongsToRecord = record.get(relationship);
          if (belongsToRecord) {
            var hasManyName = store.findHasManyRelationshipName(belongsToRecord, record);
            belongsToRecord.get(hasManyName).addObject(record);
          }
        })
      }
    });

    return promise;
  }
})
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
    var model = FactoryGuy.lookupModelForName(name);
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
    var model = FactoryGuy.lookupModelForName(name);
    var hash = {};
    hash[model] = fixture;
    return hash;
  },

  handleUpdate: function (root, id) {
    this.stubEndpointForHttpRequest(
      "/" + Em.String.pluralize(root) + "/" + id, {}, {type: 'PUT'}
    )
  },

  handleDelete: function (root, id) {
    this.stubEndpointForHttpRequest(
      "/" + Em.String.pluralize(root) + "/" + id, {}, {type: 'DELETE'}
    )
  },

  teardown: function () {
    FactoryGuy.resetModels(this.getStore());
  }
})