import Ember from 'ember';
import DS from 'ember-data';
import ModelDefinition from './model-definition';
import FixtureBuilderFactory from './builder/fixture-builder-factory';

const assign = Ember.assign || Ember.merge;
let modelDefinitions = {};

/**
 Given a fixture name like 'person' or 'dude' determine what model this name
 refers to. In this case it's 'person' for each one.

 @param {String} name  a fixture name could be model name like 'person'
 or a named person in model definition like 'dude'
 @returns {String} model  name associated with fixture name or undefined if not found
 */
let lookupModelForFixtureName = function(name) {
  let definition = lookupDefinitionForFixtureName(name);
  if (definition) {
    return definition.modelName;
  }
};

/**

 @param {String} name a fixture name could be model name like 'person'
 or a named person in model definition like 'dude'
 @returns {ModelDefinition} ModelDefinition associated with model or undefined if not found
 */
let lookupDefinitionForFixtureName = function(name) {
  for (let model in modelDefinitions) {
    let definition = modelDefinitions[model];
    if (definition.matchesName(name)) {
      return definition;
    }
  }
};

let extractArgumentsShort = function(...args) {
  let opts = {};
  if (Ember.typeOf(args[args.length - 1]) === 'object') {
    opts = args.pop();
  }
  // whatever is left are traits
  let traits = Ember.A(args).compact();
  return { opts: opts, traits: traits };
};

/**
 extract arguments for build and make function
 @param {String} name  fixture name
 @param {String} trait  optional trait names ( one or more )
 @param {Object} opts  optional fixture options that will override default fixture values
 @returns {Object} json fixture
 */
let extractArguments = function(...args) {
  let name = args.shift();
  if (!name) {
    throw new Error('Build needs a factory name to build');
  }
  return assign({ name: name }, extractArgumentsShort.apply(this, args));
};

class FactoryGuy {
  /**
   * Setting for FactoryGuy. For now, just logging settings
   *
   * logLevel: 0 is off, 1 is on
   *
   * @param opts
   */
  settings({ logLevel = 0 } = {}) {
    this.logLevel = logLevel;
  }

  setStore(aStore) {
    Ember.assert("FactoryGuy#setStore needs a valid store instance.You passed in [" + aStore + "]", aStore instanceof DS.Store);
    this.store = aStore;
    this.fixtureBuilderFactory = new FixtureBuilderFactory(this.store);
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
    return ()=> this.buildRaw(fixtureName, opts);
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
    return ()=> this.buildRawList.apply(this, args);
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
  build() {
    let args = extractArguments.apply(this, arguments);
    let fixture = this.buildRaw.apply(this, arguments);
    let modelName = lookupModelForFixtureName(args.name);

    return this.fixtureBuilder(modelName).convertForBuild(modelName, fixture);
  }

  buildRaw() {
    let args = extractArguments.apply(this, arguments);

    let definition = lookupDefinitionForFixtureName(args.name);
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
    Ember.assert("buildList needs at least a name ( of model or named factory definition )", args.length > 0);

    let list = this.buildRawList.apply(this, arguments);

    let name = args.shift();
    let modelName = lookupModelForFixtureName(name);

    return this.fixtureBuilder(modelName).convertForBuild(modelName, list);
  }

  buildRawList(...args) {
    let name = args.shift();
    let definition = lookupDefinitionForFixtureName(name);
    if (!definition) {
      throw new Error("Can't find that factory named [" + name + "]");
    }
    let number = args[0] || 0;
    if (typeof number === 'number') {
      args.shift();
      let parts = extractArgumentsShort.apply(this, args);
      return definition.buildList(name, number, parts.traits, parts.opts);
    }
    else {
      return args.map(function(innerArgs) {
        if (Ember.typeOf(innerArgs) !== 'array') {
          innerArgs = [innerArgs];
        }
        let parts = extractArgumentsShort.apply(this, innerArgs);
        return definition.build(name, parts.opts, parts.traits);
      });
    }
  }

  /**
   Make new fixture and save to store.

   @param {String} name  fixture name
   @param {String} trait  optional trait names ( one or more )
   @param {Object} options  optional fixture options that will override default fixture values
   @returns {DS.Model} record
   */
  make() {
    let args = extractArguments.apply(this, arguments);

    Ember.assert(
      `FactoryGuy does not have the application's store.
       Use manualSetup(this.container) in model/component test
       before using make/makeList`, this.store
    );

    let modelName = lookupModelForFixtureName(args.name);
    let fixture = this.buildRaw.apply(this, arguments);
    let data = this.fixtureBuilder(modelName).convertForMake(modelName, fixture);

    const model = Ember.run(()=> this.store.push(data));

    let definition = lookupDefinitionForFixtureName(args.name);
    if (definition.hasAfterMake()) {
      definition.applyAfterMake(model, args.opts);
    }
    return model;
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

    let name = args.shift();
    let definition = lookupDefinitionForFixtureName(name);
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

    return args.map((innerArgs)=> {
      if (Ember.typeOf(innerArgs) !== 'array') {
        innerArgs = [innerArgs];
      }
      return this.make(...[name, ...innerArgs]);
    });
  }

  /**
   Clear model instances from store cache.
   Reset the id sequence for the models back to zero.
   */
  clearStore() {
    this.resetDefinitions();
    this.clearModels();
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
   Clear model instances from store cache.
   */
  clearModels() {
    this.store.unloadAll();
  }

  /**
   Push fixture to model's FIXTURES array.
   Used when store's adapter is a DS.FixtureAdapter.

   @param {DS.Model} modelClass
   @param {Object} fixture the fixture to add
   @returns {Object} json fixture data
   */
  pushFixture(modelClass, fixture) {
    let index;
    if (!modelClass.FIXTURES) {
      modelClass.FIXTURES = [];
    }

    index = this.indexOfFixture(modelClass.FIXTURES, fixture);

    if (index > -1) {
      modelClass.FIXTURES.splice(index, 1);
    }

    modelClass.FIXTURES.push(fixture);

    return fixture;
  }

  /**
   Used in compliment with pushFixture in order to
   ensure we don't push duplicate fixtures

   @private
   @param {Array} fixtures
   @param {String|Integer} id of fixture to find
   @returns {Object} fixture
   */
  indexOfFixture(fixtures, fixture) {
    let index = -1,
        id    = fixture.id + '';
    Ember.A(fixtures).find(function(r, i) {
      if ('' + Ember.get(r, 'id') === id) {
        index = i;
        return true;
      } else {
        return false;
      }
    });
    return index;
  }

  /**
   Clears all model definitions
   */
  clearDefinitions(opts) {
    if (!opts) {
      this.modelDefinitions = {};
    }
  }

  /**
   Build url's for the mockjax calls. Proxy to the adapters buildURL method.

   @param {String} typeName model type name like 'user' for User model
   @param {String} id
   @return {String} url
   */
  buildURL(modelName, id = null, requestType) {
    const adapter = this.store.adapterFor(modelName);
    return adapter.buildURL(modelName, id, null, requestType);
  }

  /**
   Change reload behavior to only used cached models for find/findAll.
   You still have to handle query calls, since they always ajax for data.

   @params {Array} except list of models you don't want to mark as cached
   */
  cacheOnlyMode({ except=[] }={}) {
    let store = this.store;
    let findAdapter = store.adapterFor.bind(store);

    store.adapterFor = function(name) {
      let adapter = findAdapter(name);
      let shouldCache = ()=> {
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
}

let factoryGuy = new FactoryGuy();

let make = factoryGuy.make.bind(factoryGuy);
let makeList = factoryGuy.makeList.bind(factoryGuy);
let build = factoryGuy.build.bind(factoryGuy);
let buildList = factoryGuy.buildList.bind(factoryGuy);
let clearStore = factoryGuy.clearStore.bind(factoryGuy);

export {make, makeList, build, buildList, clearStore};
export default factoryGuy;
