import { assert } from '@ember/debug';
import { isPresent, typeOf } from '@ember/utils';
import ModelDefinition from './model-definition';
import FixtureBuilderFactory from './builder/fixture-builder-factory';
import RequestManager from './mocks/request-manager';

globalThis.modelDefinitions ??= {};

class FactoryGuy {
  /**
   * Setting for FactoryGuy.
   *
   * responseTime: 0 is fastest
   * logLevel: 0 is off, 1 is on
   *
   * @param logLevel [0/1]
   */
  settings({ logLevel = 0, responseTime = null } = {}) {
    RequestManager.settings({ responseTime });
    this.logLevel = logLevel;
    return RequestManager.settings();
  }

  setStore(aStore) {
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

   class Person extends Model {
     @attr('string') type
     @attr('string') name
   }

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
    const def = new ModelDefinition(model, config);
    globalThis.modelDefinitions[model] = def;
    return def;
  }

  /*
   @param model name of named fixture type like: 'admin' or model name like 'user'
   @returns {ModelDefinition} if there is one matching that name
   */
  findModelDefinition(model) {
    return globalThis.modelDefinitions[model];
  }

  getModelDefinitions() {
    return globalThis.modelDefinitions;
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
    let sortaRandomName =
      Math.floor((1 + Math.random()) * 65536).toString(16) + Date.now();
    return function () {
      // this function will be called by ModelDefinition, which has it's own generate method
      if (typeOf(nameOrFunction) === 'function') {
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

   @param {String} name  fixture name
   @param {String} trait  optional trait names ( one or more )
   @param {Object} opts  optional fixture options that will override default fixture values
   @returns {Function} wrapper function that will build the association json
   */
  belongsTo(...originalArgs) {
    let args = FactoryGuy.extractArguments(...originalArgs);
    return (fixture, buildType) => {
      return this.buildRaw(Object.assign(args, { buildType }));
    };
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

   @param {String} fixtureName fixture name
   @param {Number} number optional number of hasMany association items to build
   @param {String} trait optional trait names ( one or more )
   @param {Object} opts options
   @returns {Function} wrapper function that will build the association json
   */
  hasMany(...originalArgs) {
    let args = FactoryGuy.extractListArguments(...originalArgs);
    return (fixture, buildType) => {
      return this.buildRawList(Object.assign(args, { buildType }));
    };
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
    let args = FactoryGuy.extractArguments(...originalArgs),
      modelName = FactoryGuy.lookupModelForFixtureName(args.name, true),
      fixture = this.buildRaw(Object.assign(args, { buildType: 'build' }));

    return this.fixtureBuilder(modelName).convertForBuild(modelName, fixture);
  }

  /**
   Find the factory definition and use that to build the fixture

   @param name fixture name
   @param {Array} traits trait names
   @param {Object} opts  fixture options that will override default fixture values
   @param buildType 'build' or 'make'
   @returns {Object}
   */
  buildRaw({ name, opts, traits, buildType = 'build' } = {}) {
    let definition = FactoryGuy.lookupDefinitionForFixtureName(name, true);

    return definition.build(name, opts, traits, buildType);
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
   @param {Number} number optional number of fixtures to build
   @param {String} trait  optional traits (one or more)
   @param {Object} opts  optional fixture options that will override default fixture values
   @returns {Array} list of fixtures
   */
  buildList(...args) {
    this.ensureNameInArguments('buildList', args);

    args = FactoryGuy.extractListArguments(...args);

    let list = this.buildRawList(Object.assign(args, { buildType: 'build' })),
      modelName = FactoryGuy.lookupModelForFixtureName(args.name);

    return this.fixtureBuilder(modelName).convertForBuild(modelName, list);
  }

  /**
   Find the factory definition and use that to build the fixture.

   @param name fixture name
   @param {Array} traits trait names
   @param {Object} opts  fixture options that will override default fixture values
   @param buildType 'build' or 'make'
   @returns {Object}
   */
  buildRawList({ name, number, opts, buildType = 'build' } = {}) {
    let definition = FactoryGuy.lookupDefinitionForFixtureName(name, true);

    if (number >= 0) {
      let parts = FactoryGuy.extractArgumentsShort(...opts);
      return definition.buildList(
        name,
        number,
        parts.traits,
        parts.opts,
        buildType,
      );
    }

    return opts.map(function (innerArgs) {
      if (typeOf(innerArgs) !== 'array') {
        innerArgs = [innerArgs];
      }
      let parts = FactoryGuy.extractArgumentsShort(...innerArgs);
      return definition.build(name, parts.opts, parts.traits, buildType);
    });
  }

  /**
   Creates object with model attributes and relationships combined
   based on your traits and options

   @param {String} name  fixture name
   @param {String} trait  optional trait names ( one or more )
   @param {Object} options  optional fixture options that will override default fixture values
   @returns {Object} object with attributes and relationships combined
   */
  attributesFor(...originalArgs) {
    this.ensureStore();

    let args = FactoryGuy.extractArguments(...originalArgs),
      definition = FactoryGuy.lookupDefinitionForFixtureName(args.name, true),
      { modelName } = definition,
      fixture = this.buildRaw(Object.assign(args, { buildType: 'make' }));

    let data = this.fixtureBuilder(modelName).convertForMake(
      modelName,
      fixture,
    );

    return data.data.attributes;
  }

  /**
   Make new model and save to store.

   @param {String} name  fixture name
   @param {String} trait  optional trait names ( one or more )
   @param {Object} options  optional fixture options that will override default fixture values
   @returns {DS.Model} record
   */
  make(...originalArgs) {
    this.ensureStore();

    let args = FactoryGuy.extractArguments(...originalArgs),
      definition = FactoryGuy.lookupDefinitionForFixtureName(args.name, true),
      { modelName } = definition,
      fixture = this.buildRaw(Object.assign(args, { buildType: 'make' }));

    let data = this.fixtureBuilder(modelName).convertForMake(
        modelName,
        fixture,
      ),
      model = this.store.push(data);

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
    this.ensureStore();

    let args = FactoryGuy.extractArguments(...originalArgs),
      modelName = FactoryGuy.lookupModelForFixtureName(args.name, true),
      fixture = this.buildRaw(Object.assign(args, { buildType: 'make' }));

    delete fixture.id;

    return this.store.createRecord(modelName, fixture);
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
   @param {Number} number optional number of models to build
   @param {String} trait  optional trait names ( one or more )
   @param {Object} options  optional fixture options that will override default fixture values
   @returns {Array} list of json fixtures or records depending on the adapter type
   */
  makeList(...args) {
    this.ensureStore();
    this.ensureNameInArguments('makeList', args);

    let { name, number, opts } = FactoryGuy.extractListArguments(...args);

    this.ensureNameIsValid(name);

    if (number >= 0) {
      return Array(number)
        .fill()
        .map(() => this.make(...[name, ...opts]));
    }

    return opts.map((innerArgs) => {
      if (typeOf(innerArgs) !== 'array') {
        innerArgs = [innerArgs];
      }
      return this.make(...[name, ...innerArgs]);
    });
  }

  ensureNameInArguments(method, args) {
    assert(
      `[ember-data-factory-guy] ${method} needs at least a name
      ( of model or named factory definition )`,
      args.length > 0,
    );
  }

  ensureStore() {
    assert(
      `[ember-data-factory-guy] FactoryGuy does not have the application's store.
       Use manualSetup(this) in model/component test
       before using make/makeList`,
      this.store,
    );
  }

  ensureNameIsValid(name) {
    FactoryGuy.lookupDefinitionForFixtureName(name, true);
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
    for (let model in globalThis.modelDefinitions) {
      let definition = globalThis.modelDefinitions[model];
      definition.reset();
    }
  }

  /**
   Hook into store willDestroy to cleanup variables in Factory Guy and
   reset definitions/mock ajax setup.

   @param store
   */
  afterDestroyStore(store) {
    const self = this;
    const originalDestroy = store.destroy.bind(store);
    store.destroy = function () {
      originalDestroy();
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
    const clonedQueryParams = Object.assign({}, queryParams);
    // some adapters can modify the query params so use a copy
    // so as not to modify the internal stored params
    // which are important later
    return adapter.buildURL(
      modelName,
      id,
      snapshot,
      requestType,
      clonedQueryParams,
    );
  }

  /**
   Change reload behavior to only used cached models for find/findAll.
   You still have to handle query calls, since they always ajax for data.

   @params {Array} except list of models you don't want to mark as cached
   */
  cacheOnlyMode({ except = [] } = {}) {
    let store = this.store;
    let findAdapter = store.adapterFor.bind(store);

    store.adapterFor = function (name) {
      let adapter = findAdapter(name);
      let shouldCache = () => {
        if (isPresent(except)) {
          return except.includes(name);
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
   extract list arguments from makeList, buildList where the name should be first,
   and optionally a number next, or a list of traits and or options like:

   ['users', 2]  => {name: 'users', number: 2}
   ['users', 2, 'trait']  => {name: 'users', opts: ['trait']}
   ['users', 2, 'trait1', 'trait2' ] => {name: 'users', number: 2, opts: ['trait1', 'trait2']}
   ['users', 'trait1', 'trait2' ] =>
   {name: 'users', number: undefined, opts: ['trait1', 'trait2']}
   ['users', 'trait1', 'trait2', {name: 'Bob'} ] =>
   {name: 'users', number: undefined, opts: ['trait1', 'trait2', {name: 'Bob'}]}

   @param args
   @returns {{name: *, number: (*|number), opts: *[]}}
   */
  static extractListArguments(...args) {
    args = args.slice();
    let name = args.shift(),
      number = args[0] || 0;
    if (typeof number === 'number') {
      args.shift();
    } else {
      number = undefined;
    }
    return { name, number, opts: args };
  }

  /**
   extract arguments for build and make function

   @param {String} name  fixture name
   @param {String} trait  optional trait names ( one or more )
   @param {Object} opts  optional fixture options that will override default fixture values
   @returns {Object} json fixture
   */
  static extractArguments(...args) {
    args = args.slice();
    let name = args.shift();
    if (!name) {
      throw new Error(
        '[ember-data-factory-guy] build/make needs a factory name to build',
      );
    }
    return Object.assign({ name }, FactoryGuy.extractArgumentsShort(...args));
  }

  static extractArgumentsShort(...args) {
    args = args.slice();
    let opts = {};
    if (typeOf(args[args.length - 1]) === 'object') {
      opts = args.pop();
    }
    // whatever is left are traits
    let traits = args.filter((item) => item != null);
    return { opts, traits };
  }

  /**

   @param {String} name a fixture name could be model name like 'person'
   or a named person in model definition like 'dude'
   @param {Boolean} assertItExists true if you want to throw assertion if no definition found
   @returns {ModelDefinition} ModelDefinition associated with model or undefined if not found
   */
  static lookupDefinitionForFixtureName(name, assertItExists = false) {
    let definition;
    for (let model in globalThis.modelDefinitions) {
      definition = globalThis.modelDefinitions[model];
      if (definition.matchesName(name)) {
        return definition;
      }
    }

    assert(
      `[ember-data-factory-guy] Can't find that factory named [ ${name} ]`,
      !definition && assertItExists,
    );
  }

  /**
   Given a fixture name like 'person' or 'dude' determine what model this name
   refers to. In this case it's 'person' for each one.

   @param {String} name  a fixture name could be model name like 'person'
   or a named person in model definition like 'dude'
   @returns {String} model  name associated with fixture name or undefined if not found
   */
  static lookupModelForFixtureName(name, assertItExists = false) {
    let definition = this.lookupDefinitionForFixtureName(name, assertItExists);
    if (definition) {
      return definition.modelName;
    }
  }
}

let factoryGuy = new FactoryGuy(),
  make = factoryGuy.make.bind(factoryGuy),
  makeNew = factoryGuy.makeNew.bind(factoryGuy),
  makeList = factoryGuy.makeList.bind(factoryGuy),
  build = factoryGuy.build.bind(factoryGuy),
  buildList = factoryGuy.buildList.bind(factoryGuy),
  attributesFor = factoryGuy.attributesFor.bind(factoryGuy);

export { make, makeNew, makeList, build, buildList, attributesFor };
export default factoryGuy;
