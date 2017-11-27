import Ember from 'ember';
import DS from 'ember-data';
import ModelDefinition from './model-definition';
import FixtureBuilderFactory from './builder/fixture-builder-factory';
import RequestManager from './mocks/request-manager';
import { assign } from '@ember/polyfills';

let modelDefinitions = {};

class FactoryGuy {
  /**
   * Setting for FactoryGuy.
   *
   * responseTime: 0 is fastest
   * logLevel: 0 is off, 1 is on
   *
   * @param logLevel [0/1]
   */
  settings({logLevel = 0, responseTime = null} = {}) {
    RequestManager.settings({responseTime});
    this.logLevel = logLevel;
    return RequestManager.settings();
  }

  setStore(aStore) {
    Ember.assert(
      `FactoryGuy#setStore needs a valid store instance. You passed in [${aStore}]`,
      aStore instanceof DS.Store
    );
    this.store = aStore;
    this.fixtureBuilderFactory = new FixtureBuilderFactory(this.store);
    this.afterDestroyStore(aStore);
  }

  fixtureBuilder(modelName) {
    return this.fixtureBuilderFactory.fixtureBuilder(modelName);
  }

  updateHTTPMethod(modelName) {
    return this.fixtureBuilder(modelName).updateHTTPMethod || 'PUT';
  }

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
  define(model, config) {
    modelDefinitions[model] = new ModelDefinition(model, config);
  }

  /*
   @param model name of named fixture type like: 'admin' or model name like 'user'
   @returns {ModelDefinition} if there is one matching that name
   */
  findModelDefinition(model) {
    return modelDefinitions[model];
  }

  getModelDefinitions() {
    return modelDefinitions;
  }

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

   @param {String|Function} nameOrFunction value previously declared sequence name or
   an inline function to use as the sequence
   @returns {Function} wrapper function that is called by the model
   definition containing the sequence
   */
  generate(nameOrFunction) {
    let sortaRandomName = Math.floor((1 + Math.random()) * 65536).toString(16) + Date.now();
    return function() {
      // this function will be called by ModelDefinition, which has it's own generate method
      if (Ember.typeOf(nameOrFunction) === 'function') {
        return this.generate(sortaRandomName, nameOrFunction);
      } else {
        return this.generate(nameOrFunction);
      }
    };
  }

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
  belongsTo(fixtureName, opts) {
    return () => this.buildRaw(fixtureName, opts);
  }

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
  hasMany(...args) {
    return () => this.buildRawList(...args);
  }

  /**
   Build fixtures for model or specific fixture name.

   For example:

   ```

   FactoryGuy.build('user') for User model
   FactoryGuy.build('bob') for a 'bob' User
   FactoryGuy.build('bob', 'dude') for a 'bob' User with dude traits
   FactoryGuy.build('bob', 'dude', 'funny') for a 'bob' User with dude and funny traits
   FactoryGuy.build('bob', 'dude', {name: 'wombat'}) for a 'bob' User with dude trait and custom attribute name of 'wombat'

   ```

   @param {String} name  fixture name
   @param {String} trait  optional trait names ( one or more )
   @param {Object} opts  optional fixture options that will override default fixture values
   @returns {Object} json fixture
   */
  build(...originalArgs) {
    let args      = FactoryGuy.extractArguments(...originalArgs),
        fixture   = this.buildRaw(...originalArgs),
        modelName = FactoryGuy.lookupModelForFixtureName(args.name);

    return this.fixtureBuilder(modelName).convertForBuild(modelName, fixture);
  }

  buildRaw(...args) {
    args = FactoryGuy.extractArguments(...args);

    let definition = FactoryGuy.lookupDefinitionForFixtureName(args.name);
    if (!definition) {
      throw new Error('Can\'t find that factory named [' + args.name + ']');
    }

    return definition.build(args.name, args.opts, args.traits);
  }

  /**
   Build list of fixtures for model or specific fixture name. For example:

   ```

   FactoryGuy.buildList('user') // for 0 User models
   FactoryGuy.buildList('user', 2) // for 2 User models
   FactoryGuy.build('bob', 2) // for 2 User model with bob attributes
   FactoryGuy.build('bob', 'with_car', ['with_car',{name: "Dude"}])
   // 2 User model with bob attributes, where the first also has 'with_car' trait
   // the last has 'with_car' trait and name of "Dude"

   ```

   @param {String} name  fixture name
   @param {Number} number  number of fixtures to create
   @param {String} trait  optional traits (one or more)
   @param {Object} opts  optional fixture options that will override default fixture values
   @returns {Array} list of fixtures
   */
  buildList(...args) {
    Ember.assert(
      "buildList needs at least a name ( of model or named factory definition )",
      args.length > 0
    );

    let list      = this.buildRawList(...args),
        name      = args.shift(),
        modelName = FactoryGuy.lookupModelForFixtureName(name);

    return this.fixtureBuilder(modelName).convertForBuild(modelName, list);
  }

  buildRawList(...args) {
    let name       = args.shift(),
        definition = FactoryGuy.lookupDefinitionForFixtureName(name);
    if (!definition) {
      throw new Error("Can't find that factory named [" + name + "]");
    }
    let number = args[0] || 0;
    if (typeof number === 'number') {
      args.shift();
      let parts = FactoryGuy.extractArgumentsShort(...args);
      return definition.buildList(name, number, parts.traits, parts.opts);
    }
    else {
      return args.map(function(innerArgs) {
        if (Ember.typeOf(innerArgs) !== 'array') {
          innerArgs = [innerArgs];
        }
        let parts = FactoryGuy.extractArgumentsShort(...innerArgs);
        return definition.build(name, parts.opts, parts.traits);
      });
    }
  }

  /**
   Make new model and save to store.

   @param {String} name  fixture name
   @param {String} trait  optional trait names ( one or more )
   @param {Object} options  optional fixture options that will override default fixture values
   @returns {DS.Model} record
   */
  make(...originalArgs) {
    let args = FactoryGuy.extractArguments(...originalArgs);

    Ember.assert(
      `FactoryGuy does not have the application's store.
       Use manualSetup(this.container) in model/component test
       before using make/makeList`, this.store
    );

    let modelName  = FactoryGuy.lookupModelForFixtureName(args.name),
        fixture    = this.buildRaw(...originalArgs),
        data       = this.fixtureBuilder(modelName).convertForMake(modelName, fixture),
        model      = Ember.run(() => this.store.push(data)),
        definition = FactoryGuy.lookupDefinitionForFixtureName(args.name);

    if (definition.hasAfterMake()) {
      definition.applyAfterMake(model, args.opts);
    }
    return model;
  }

  /**
   Make new model.

   @param {String} name  fixture name
   @param {String} trait  optional trait names ( one or more )
   @param {Object} options  optional fixture options that will override default fixture values
   @returns {DS.Model} record
   */
  makeNew(...originalArgs) {
    let args = FactoryGuy.extractArguments(...originalArgs);

    Ember.assert(
      `FactoryGuy does not have the application's store.
       Use manualSetup(this.container) in model/component test
       before using makeNew`, this.store
    );

    let modelName = FactoryGuy.lookupModelForFixtureName(args.name),
        fixture   = this.buildRaw(...originalArgs);
    delete fixture.id;

    let data = this.fixtureBuilder(modelName).convertForBuild(modelName, fixture, {transformKeys: false});

    return Ember.run(() => this.store.createRecord(modelName, data.get()));
  }

  /**
   Make a list of model instances

   ```
   FactoryGuy.makeList('bob') // makes 0 bob's

   FactoryGuy.makeList('bob', 2) // makes 2 bob's

   FactoryGuy.makeList('bob', 2, 'with_car' , {name: "Dude"})
   // makes 2 bob's that have 'with_car' trait and name of "Dude"

   FactoryGuy.makeList('bob', 'with_car', ['with_car',{name: "Dude"}])
   // 2 User model with bob attributes, where the first also has 'with_car' trait
   // the last has 'with_car' trait and name of "Dude"
   ```

   @param {String} name name of fixture
   @param {Number} number number to create
   @param {String} trait  optional trait names ( one or more )
   @param {Object} options  optional fixture options that will override default fixture values
   @returns {Array} list of json fixtures or records depending on the adapter type
   */
  makeList(...args) {
    Ember.assert(
      `FactoryGuy does not have the application's store.
       Use manualSetup(this.container) in model/component test
       before using make/makeList`, this.store
    );

    Ember.assert("makeList needs at least a name ( of model or named factory definition )", args.length >= 1);

    let name       = args.shift(),
        definition = FactoryGuy.lookupDefinitionForFixtureName(name);
    Ember.assert("Can't find that factory named [" + name + "]", !!definition);

    let number = args[0] || 0;
    if (typeof number === 'number') {
      args.shift();
      let arr = [];
      for (let i = 0; i < number; i++) {
        arr.push(this.make.apply(this, [name, ...args]));
      }
      return arr;
    }

    return args.map((innerArgs) => {
      if (Ember.typeOf(innerArgs) !== 'array') {
        innerArgs = [innerArgs];
      }
      return this.make(...[name, ...innerArgs]);
    });
  }

  reset() {
    this.resetDefinitions();
    this.resetMockAjax();
  }

  /**
   Reset all mock ajax calls
   */
  resetMockAjax() {
    RequestManager.reset();
  }

  /**
   Reset the id sequence for the models back to zero.
   */
  resetDefinitions() {
    for (let model in modelDefinitions) {
      let definition = modelDefinitions[model];
      definition.reset();
    }
  }

  /**
   Hook into store willDestroy to cleanup variables in Factory Guy and
   reset definitions/mock ajax setup.

   This eliminates the need to call mockTeardown manually in tests

   @param store
   */
  afterDestroyStore(store) {
    const self = this;
    const originalWillDestroy = store.willDestroy.bind(store);
    store.willDestroy = function() {
      originalWillDestroy();
      self.store = null;
      self.fixtureBuilderFactory = null;
      self.reset();
    };
  }

  /**
   Build url's for the mockjax calls. Proxy to the adapters buildURL method.

   @param {String} modelName model type name like 'user' for User model
   @param {String} id
   @param {String} snapshot usually null, but passing adapterOptions for GET requests
   @return {String} requestType string like 'findRecord', 'queryRecord'
   @return {String} queryParams optional
   */
  buildURL(modelName, id = null, snapshot, requestType, queryParams) {
    const adapter = this.store.adapterFor(modelName);
    return adapter.buildURL(modelName, id, snapshot, requestType, queryParams);
  }

  /**
   Change reload behavior to only used cached models for find/findAll.
   You still have to handle query calls, since they always ajax for data.

   @params {Array} except list of models you don't want to mark as cached
   */
  cacheOnlyMode({except = []} = {}) {
    let store = this.store;
    let findAdapter = store.adapterFor.bind(store);

    store.adapterFor = function(name) {
      let adapter = findAdapter(name);
      let shouldCache = () => {
        if (Ember.isPresent(except)) {
          return (Ember.A(except).includes(name));
        }
        return false;
      };
      adapter.shouldBackgroundReloadAll = shouldCache;
      adapter.shouldBackgroundReloadRecord = shouldCache;
      adapter.shouldReloadRecord = shouldCache;
      adapter.shouldReloadAll = shouldCache;
      return adapter;
    };
  }

  /**
   extract arguments for build and make function

   @param {String} name  fixture name
   @param {String} trait  optional trait names ( one or more )
   @param {Object} opts  optional fixture options that will override default fixture values
   @returns {Object} json fixture
   */
  static extractArguments(...args) {
    let name = args.shift();
    if (!name) {
      throw new Error('Build needs a factory name to build');
    }
    return assign({name: name}, FactoryGuy.extractArgumentsShort(...args));
  }

  static extractArgumentsShort(...args) {
    let opts = {};
    if (Ember.typeOf(args[args.length - 1]) === 'object') {
      opts = args.pop();
    }
    // whatever is left are traits
    let traits = Ember.A(args).compact();
    return {opts: opts, traits: traits};
  }

  /**

   @param {String} name a fixture name could be model name like 'person'
   or a named person in model definition like 'dude'
   @returns {ModelDefinition} ModelDefinition associated with model or undefined if not found
   */
  static lookupDefinitionForFixtureName(name) {
    for (let model in modelDefinitions) {
      let definition = modelDefinitions[model];
      if (definition.matchesName(name)) {
        return definition;
      }
    }
  }

  /**
   Given a fixture name like 'person' or 'dude' determine what model this name
   refers to. In this case it's 'person' for each one.

   @param {String} name  a fixture name could be model name like 'person'
   or a named person in model definition like 'dude'
   @returns {String} model  name associated with fixture name or undefined if not found
   */
  static lookupModelForFixtureName(name) {
    let definition = this.lookupDefinitionForFixtureName(name);
    if (definition) {
      return definition.modelName;
    }
  }

}

let factoryGuy = new FactoryGuy(),
    make       = factoryGuy.make.bind(factoryGuy),
    makeNew    = factoryGuy.makeNew.bind(factoryGuy),
    makeList   = factoryGuy.makeList.bind(factoryGuy),
    build      = factoryGuy.build.bind(factoryGuy),
    buildList  = factoryGuy.buildList.bind(factoryGuy);

export { make, makeNew, makeList, build, buildList };
export default factoryGuy;
