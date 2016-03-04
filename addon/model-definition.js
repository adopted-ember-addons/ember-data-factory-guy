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
let ModelDefinition = function (model, config) {
  let sequences = {};
  let traits = {};
  let transient = {};
  let afterMake = null;
  let defaultAttributes = {};
  let namedModels = {};
  let modelId = 1;
  let sequenceName = null;
  let modelName = this.modelName = model;

  /**
   Returns a model's full relationship if the field is a relationship.

   @param {String} field  field you want to relationship info for
   @returns {DS.Relationship} relationship object if the field is a relationship, null if not
   */
  let getRelationship = function (field) {
    let modelClass = FactoryGuy.store.modelFor(modelName);
    let relationship = Ember.get(modelClass, 'relationshipsByName').get(field);
    return relationship || null;
  };
  /**
   @param {String} name model name like 'user' or named type like 'admin'
   @returns {Boolean} true if name is this definitions model or this definition
   contains a named model with that name
   */
  this.matchesName = function (name) {
    return modelName === name || namedModels[name];
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
    let sequence = sequences[name];
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
    let traitsObj = {};
    traitArgs.forEach(function (trait) {
      $.extend(traitsObj, traits[trait]);
    });
    let modelAttributes = namedModels[name] || {};
    // merge default, modelAttributes, traits and opts to get the rough fixture
    let fixture = $.extend({}, defaultAttributes, modelAttributes, traitsObj, opts);
    // deal with attributes that are functions or objects
    for (let attribute in fixture) {
      let attributeType = Ember.typeOf(fixture[attribute]);
      if ( attributeType === 'array') {
        this.addArrayAtribute(fixture, attribute);
      }
      if (attributeType === 'function') {
        this.addFunctionAttribute(fixture, attribute);
      } else if (attributeType === 'object') {
        this.addObjectAtribute(fixture, attribute);
      }
    }
    // set the id, unless it was already set in opts
    if (!fixture.id) {
      fixture.id = this.nextId();
    }
    return fixture;
  };

  // function might be a sequence, an inline attribute function or an association
  this.addFunctionAttribute = function(fixture, attribute) {
    fixture[attribute] = fixture[attribute].call(this, fixture);
  };

  this.addArrayAtribute = function(fixture, attribute) {
    let relationship = getRelationship(attribute);
    if (relationship) {
      let payload = fixture[attribute];

      fixture[attribute] = payload.map((json)=>{
        let isInstance = Ember.typeOf(json) === "instance";
        return !isInstance && json.get ? json.get() : json;
      });
    }
  };

  this.addObjectAtribute = function(fixture, attribute) {
    // If it's an object and it's a model association attribute, build the json
    // for the association and replace the attribute with that json
    let relationship = getRelationship(attribute);
    if (relationship) {
      let payload = fixture[attribute];
      if (payload.get) {
        //console.log('here2', 'attribute:', attribute, fixture[attribute], payload.get());
        // FactoryGuy already built this it's already built json
        fixture[attribute] = payload.get();
      } else {
        fixture[attribute] = FactoryGuy.buildRaw(relationship.type, payload);
      }
    }
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
    let arr = [];
    for (let i = 0; i < number; i++) {
      arr.push(this.build(name, opts, traits));
    }
    return arr;
  };
  // Set the modelId back to 1, and reset the sequences
  this.reset = function () {
    modelId = 1;
    for (let name in sequences) {
      sequences[name].reset();
    }
  };

  this.hasAfterMake = function () {
    return !!afterMake;
  };

  this.applyAfterMake = function (model, opts) {
    if (afterMake) {
      // passed in options override transient setting
      let options = $.extend({}, transient, opts);
      afterMake(model, options);
    }
  };
  /*
   Need special 'merge' function to be able to merge objects with functions

   @param newConfig
   @param config
   @param otherConfig
   @param section
   */
  let mergeSection = function (config, otherConfig, section) {
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
  };
  /**
   When extending another definition, merge it with this one by:
   merging only sequences, default section and traits

   @param {Object} config
   @param {ModelDefinition} otherDefinition
   */
  let merge = function (config, otherDefinition) {
    let otherConfig = $.extend(true, {}, otherDefinition.originalConfig);
    delete otherConfig.extends;
    mergeSection(config, otherConfig, 'sequences');
    mergeSection(config, otherConfig, 'default');
    mergeSection(config, otherConfig, 'traits');
  };

  let mergeConfig = function (config) {
    let extending = config.extends;
    let definition = FactoryGuy.findModelDefinition(extending);
    Ember.assert(
      "You are trying to extend [" + model + "] with [ " + extending + " ]." +
      " But FactoryGuy can't find that definition [ " + extending + " ] " +
      "you are trying to extend. Make sure it was created/imported before " +
      "you define [" + model + "]", definition);
    merge(config, definition);
  };

  let parseDefault = function (config) {
    defaultAttributes = config.default;
    delete config.default;
  };

  let parseTraits = function (config) {
    traits = config.traits;
    delete config.traits;
  };

  let parseTransient = function (config) {
    transient = config.transient;
    delete config.transient;
  };

  let parseCallBacks = function (config) {
    afterMake = config.afterMake;
    delete config.afterMake;
  };

  let parseSequences = function (config) {
    sequences = config.sequences || {};
    delete config.sequences;
    for (sequenceName in sequences) {
      let sequenceFn = sequences[sequenceName];
      if (Ember.typeOf(sequenceFn) !== 'function') {
        throw new Error(
          'Problem with [' + sequenceName + '] sequence definition. ' +
          'Sequences must be functions');
      }
      sequences[sequenceName] = new Sequence(sequenceFn);
    }
  };

  let parseConfig = function (config) {
    if (config.extends) {
      mergeConfig.call(this, config);
    }
    parseSequences(config);
    parseTraits(config);
    parseDefault(config);
    parseTransient(config);
    parseCallBacks(config);
    namedModels = config;
  };
  // During parseConfig, the original config will be altered, so save this original
  // configuration since it's needed for merging when others extend this definition.
  this.originalConfig = $.extend(true, {}, config);
  // initialize
  parseConfig.call(this, config);
};

export default ModelDefinition;

