import Ember from 'ember';
import FactoryGuy from './factory-guy';
import Sequence from './sequence';
import MissingSequenceError from './missing-sequence-error';
import $ from 'jquery';

/**
 A ModelDefinition encapsulates a model's definition

 @param model
 @param config
 @constructor
 */
class ModelDefinition {

  constructor(model, config) {
    this.modelName = model;
    this.modelId = 1;
    this.originalConfig = $.extend(true, {}, config);
    this.parseConfig(config);
  }

  /**
   Returns a model's full relationship if the field is a relationship.

   @param {String} field  field you want to relationship info for
   @returns {DS.Relationship} relationship object if the field is a relationship, null if not
   */
  getRelationship(field) {
    let modelClass = FactoryGuy.store.modelFor(this.modelName);
    let relationship = Ember.get(modelClass, 'relationshipsByName').get(field);
    return relationship || null;
  }

  /**
   Is this attribute a model fragment type

   @param {String} field  field you want to check
   @returns {Boolean} true if it's a model fragment
   */
  isModelFragmentAttribute(field) {
    let modelClass = FactoryGuy.store.modelFor(this.modelName);
    let attributeInfo = Ember.get(modelClass, 'attributes').get(field);
    return (attributeInfo && attributeInfo.type && attributeInfo.type.match('mf-fragment'));
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
    return this.modelId++;
  }

  // Decrement id
  backId() {
    return this.modelId--;
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
        `Can not find that sequence named [${name}] in '${this.modelName}' definition`
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
  build(name, opts, traitArgs) {
    let traitsObj = {};
    traitArgs.forEach((trait)=> {
      $.extend(traitsObj, this.traits[trait]);
    });
    let modelAttributes = this.namedModels[name] || {};
    // merge default, modelAttributes, traits and opts to get the rough fixture
    let fixture = $.extend({}, this.defaultAttributes, modelAttributes, traitsObj, opts);

    // set the id, unless it was already set in opts
    if (!fixture.id) {
      // Setting a flag to indicate that this is a generated an id,
      // so it can be rolled back if the fixture throws an error.
      fixture._generatedId = true;
      fixture.id = this.nextId();
    }

    try {
      // deal with attributes that are functions or objects
      for (let attribute in fixture) {
        let attributeType = Ember.typeOf(fixture[attribute]);
        if (attributeType === 'function') {
          this.addFunctionAttribute(fixture, attribute);
        } else if (attributeType === 'object') {
          this.addObjectAtribute(fixture, attribute);
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
  addFunctionAttribute(fixture, attribute) {
    fixture[attribute] = fixture[attribute].call(this, fixture);
  }

  addObjectAtribute(fixture, attribute) {
    // If it's an object and it's a model association attribute, build the json
    // for the association and replace the attribute with that json
    let relationship = this.getRelationship(attribute);
    if (this.isModelFragmentAttribute(attribute)) {
      let payload = fixture[attribute];
      fixture[attribute] = FactoryGuy.buildRaw(attribute, payload);
      return;
    }
    if (relationship) {
      let payload = fixture[attribute];
      if (!payload.isProxy) {
        fixture[attribute] = FactoryGuy.buildRaw(relationship.type, payload);
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
  buildList(name, number, traits, opts) {
    let arr = [];
    for (let i = 0; i < number; i++) {
      arr.push(this.build(name, opts, traits));
    }
    return arr;
  }

  // Set the modelId back to 1, and reset the sequences
  reset() {
    this.modelId = 1;
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
      let options = $.extend({}, this.transient, opts);
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
    let otherConfig = $.extend(true, {}, otherDefinition.originalConfig);
    delete otherConfig.extends;
    this.mergeSection(config, otherConfig, 'sequences');
    this.mergeSection(config, otherConfig, 'default');
    this.mergeSection(config, otherConfig, 'traits');
  }

  mergeConfig(config) {
    let extending = config.extends;
    let definition = FactoryGuy.findModelDefinition(extending);
    Ember.assert(
      `You are trying to extend [${this.modelName}] with [ ${extending} ].
      But FactoryGuy can't find that definition [ ${extending} ]
      you are trying to extend. Make sure it was created/imported before
      you define [ ${this.modelName} ]`, definition);
    this.merge(config, definition);
  }

  parseDefault(config) {
    this.defaultAttributes = config.default || {};
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

  parseSequences(config) {
    this.sequences = config.sequences || {};
    delete config.sequences;
    for (let sequenceName in this.sequences) {
      let sequenceFn = this.sequences[sequenceName];
      if (Ember.typeOf(sequenceFn) !== 'function') {
        throw new Error(
          `Problem with [${sequenceName}] sequence definition.
          Sequences must be functions`);
      }
      this.sequences[sequenceName] = new Sequence(sequenceFn);
    }
  }

  parseConfig(config) {
    if (config.extends) {
      this.mergeConfig(config);
    }
    this.parseSequences(config);
    this.parseTraits(config);
    this.parseDefault(config);
    this.parseTransient(config);
    this.parseCallBacks(config);
    this.namedModels = config;
  }
}

export default ModelDefinition;

