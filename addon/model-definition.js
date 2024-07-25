import FactoryGuy from './factory-guy';
import Sequence from './sequence';
import MissingSequenceError from './missing-sequence-error';
import { mergeDeep } from './utils/helper-functions';
import { assert } from '@ember/debug';
import { typeOf } from '@ember/utils';

/**
 A ModelDefinition encapsulates a model's definition

 @param model
 @param config
 @constructor
 */
class ModelDefinition {
  modelIdCounter = 1;

  get modelId() {
    return String(this.modelIdCounter);
  }

  constructor(model, config) {
    this.modelName = model;
    this.originalConfig = mergeDeep({}, config);
    this.parseConfig(Object.assign({}, config));
  }

  /**
   Returns a model's full relationship if the field is a relationship.

   @param {String} field  field you want to relationship info for
   @returns {DS.Relationship} relationship object if the field is a relationship, null if not
   */
  getRelationship(field) {
    let modelClass = FactoryGuy.store.modelFor(this.modelName);
    let relationship = modelClass.relationshipsByName.get(field);
    return relationship || null;
  }

  /**
   @param {String} name model name like 'user' or named type like 'admin'
   @returns {Boolean} true if name is this definitions model or this definition
   contains a named model with that name
   */
  matchesName(name) {
    return this.modelName === name || this.namedModels[name];
  }

  // Increment id
  nextId() {
    const nextId = this.modelId;
    this.modelIdCounter++;
    return nextId;
  }

  // Decrement id
  backId() {
    const nextId = this.modelId;
    this.modelIdCounter--;
    return nextId;
  }

  /**
   Call the next method on the named sequence function. If the name
   is a function, create the sequence with that function

   @param   {String} name previously declared sequence name or
   an the random name generate for inline functions
   @param   {Function} sequenceFn optional function to use as sequence
   @returns {String} output of sequence function
   */
  generate(name, sequenceFn) {
    if (sequenceFn) {
      if (!this.sequences[name]) {
        // create and add that sequence function on the fly
        this.sequences[name] = new Sequence(sequenceFn);
      }
    }
    let sequence = this.sequences[name];
    if (!sequence) {
      throw new MissingSequenceError(
        `[ember-data-factory-guy] Can't find that sequence named [${name}] in '${this.modelName}' definition`,
      );
    }
    return sequence.next();
  }

  /**
   Build a fixture by name

   @param {String} name fixture name
   @param {Object} opts attributes to override
   @param {String} traitArgs array of traits
   @returns {Object} json
   */
  build(name, opts = {}, traitNames = [], buildType = 'build') {
    let modelAttributes = this.namedModels[name] || {};

    // merge default, modelAttributes, traits and opts to get the rough fixture
    let fixture = Object.assign({}, this.default, modelAttributes);

    // set the id, unless it was already set in opts
    if (!fixture.id && !opts.id) {
      // Setting a flag to indicate that this is a generated an id,
      // so it can be rolled back if the fixture throws an error.
      fixture._generatedId = true;
      fixture.id = this.nextId();
    }

    if (this.notPolymorphic !== undefined) {
      fixture._notPolymorphic = true;
    }

    traitNames.forEach((traitName) => {
      let trait = this.traits[traitName];
      assert(
        `[ember-data-factory-guy] You're trying to use a trait [${traitName}]
        for model ${this.modelName} but that trait can't be found.`,
        trait,
      );
      if (typeOf(trait) === 'function') {
        trait(fixture);
      }
      Object.assign(fixture, trait);
    });

    Object.assign(fixture, opts);

    try {
      // deal with attributes that are functions or objects
      for (let attribute in fixture) {
        let attributeType = typeOf(fixture[attribute]);
        if (attributeType === 'function') {
          this.addFunctionAttribute(fixture, attribute, buildType);
        } else if (attributeType === 'object') {
          this.addObjectAttribute(fixture, attribute, buildType);
        }
      }
    } catch (e) {
      if (fixture._generatedId) {
        this.backId();
      }
      throw e;
    }

    delete fixture._generatedId;
    return fixture;
  }

  // function might be a sequence, an inline attribute function or an association
  addFunctionAttribute(fixture, attribute, buildType) {
    fixture[attribute] = fixture[attribute].call(this, fixture, buildType);
  }

  addObjectAttribute(fixture, attribute, buildType) {
    // If it's an object and it's a model association attribute, build the json
    // for the association and replace the attribute with that json
    let relationship = this.getRelationship(attribute);

    if (relationship) {
      let payload = fixture[attribute];
      if (!payload.isProxy && !payload.links) {
        fixture[attribute] = FactoryGuy.buildRaw({
          name: relationship.type,
          opts: payload,
          buildType,
        });
      }
    }
  }

  /**
   Build a list of fixtures

   @param {String} name model name or named model type
   @param {Integer} number of fixtures to build
   @param {Array} array of traits to build with
   @param {Object} opts attribute options
   @returns array of fixtures
   */
  buildList(name, number, traits, opts, buildType) {
    return Array(number)
      .fill()
      .map(() => this.build(name, opts, traits, buildType));
  }

  // Set the modelId back to 1, and reset the sequences
  reset() {
    this.modelIdCounter = 1;
    for (let name in this.sequences) {
      this.sequences[name].reset();
    }
  }

  hasAfterMake() {
    return !!this.afterMake;
  }

  applyAfterMake(model, opts) {
    if (this.afterMake) {
      // passed in options override transient setting
      let options = Object.assign({}, this.transient, opts);
      this.afterMake(model, options);
    }
  }

  /*
   Need special 'merge' function to be able to merge objects with functions

   @param newConfig
   @param config
   @param otherConfig
   @param section
   */
  mergeSection(config, otherConfig, section) {
    let attr;
    if (otherConfig[section]) {
      if (!config[section]) {
        config[section] = {};
      }
      for (attr in otherConfig[section]) {
        if (!config[section][attr]) {
          config[section][attr] = otherConfig[section][attr];
        }
      }
    }
  }

  /**
   When extending another definition, merge it with this one by:
   merging only sequences, default section and traits

   @param {Object} config
   @param {ModelDefinition} otherDefinition
   */
  merge(config, otherDefinition) {
    let otherConfig = mergeDeep({}, otherDefinition.originalConfig);
    delete otherConfig.extends;
    this.mergeSection(config, otherConfig, 'sequences');
    // not sure why I have to use main definition for default,
    // but it works, so umm .. errr .. yeah
    this.mergeSection(config, otherDefinition, 'default');
    this.mergeSection(config, otherConfig, 'traits');
  }

  mergeConfig(config) {
    let definition = config.extends;
    this.merge(config, definition);
  }

  parseDefault(config) {
    this.default = config.default || {};
    delete config.default;
  }

  parseTraits(config) {
    this.traits = config.traits || {};
    delete config.traits;
  }

  parseTransient(config) {
    this.transient = config.transient || {};
    delete config.transient;
  }

  parseCallBacks(config) {
    this.afterMake = config.afterMake;
    delete config.afterMake;
  }

  parsePolymorphicSetting(config) {
    if (config.polymorphic !== undefined && config.polymorphic === false) {
      this.notPolymorphic = true;
      delete config.polymorphic;
    }
  }

  parseSequences(config) {
    this.sequences = config.sequences || {};
    delete config.sequences;
    for (let sequenceName in this.sequences) {
      let sequenceFn = this.sequences[sequenceName];

      if (typeOf(sequenceFn) !== 'function') {
        throw new Error(
          `Problem with [${sequenceName}] sequence definition.
          Sequences must be functions`,
        );
      }
      this.sequences[sequenceName] = new Sequence(sequenceFn);
    }
  }

  parseConfig(config) {
    if (config.extends) {
      this.mergeConfig(config);
    }
    this.parsePolymorphicSetting(config);
    this.parseSequences(config);
    this.parseTraits(config);
    this.parseDefault(config);
    this.parseTransient(config);
    this.parseCallBacks(config);
    this.namedModels = config;
  }
}

export default ModelDefinition;
