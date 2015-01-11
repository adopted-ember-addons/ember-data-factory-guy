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
