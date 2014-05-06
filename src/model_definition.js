ModelDefinition = function (model, config) {
  var sequences = {};
  var defaultAttributes = {};
  var namedModels = {};
  var modelId = 1;
  this.model = model;

  /**
   @param name model name like 'user' or named type like 'admin'
   @return boolean true if name is this definitions model or this definition
           contains a named model with that name
   */
  this.matchesName = function (name) {
    return model == name || namedModels[name];
  }

  this.merge = function (config) {
  }

  /**
    @param sequenceName
    @returns output of sequence function
   */
  this.generate = function (sequenceName) {
    if (!sequences[sequenceName]) {
      throw new MissingSequenceError("Can not find that sequence named ["+sequenceName+"] in '"+ model+"' definition")
    }
    return sequences[sequenceName].next();
  }

  this.build = function (name, opts) {
    var modelAttributes = namedModels[name] || {};
    var fixture = $.extend({}, defaultAttributes, modelAttributes, opts);
    for (attr in fixture) {
      if (typeof fixture[attr] == 'function') {
        fixture[attr] = fixture[attr].call(this)
      }
    }
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

  this.reset = function () {
    modelId = 1;
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