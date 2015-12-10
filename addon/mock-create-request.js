import Ember from 'ember';
import FactoryGuy from './factory-guy';
import $ from 'jquery';

var MockCreateRequest = function (url, modelName, options) {
  var status = options.status;
  var succeed = options.succeed === undefined ? true : options.succeed;
  var matchArgs = options.match;
  var returnArgs = options.returns;
  var responseJson = {};
  var expectedRequest = {};
  var store = FactoryGuy.get('store');

  this.calculate = function () {
    if (matchArgs) {
      // Using this technique to get properly serialized payload.
      // Although it's not ideal to have to create and delete a record,
      // TODO: Figure out how to use serializer without a record instance
      var tmpRecord = store.createRecord(modelName, matchArgs);
      expectedRequest = tmpRecord.serialize();
      tmpRecord.deleteRecord();
    }

    if (succeed) {
      var modelClass = store.modelFor(modelName);
      responseJson = $.extend({}, matchArgs, returnArgs);
      // Remove belongsTo associations since they will already be set when you called
      // createRecord, so they don't need to be returned.
      Ember.get(modelClass, 'relationshipsByName').forEach(function (relationship) {
        if (relationship.kind === 'belongsTo') {
          delete responseJson[relationship.key];
        }
      });
    }
  };

  this.match = function (matches) {
    matchArgs = matches;
    this.calculate();
    return this;
  };

  this.andReturn = function (returns) {
    returnArgs = returns;
    this.calculate();
    return this;
  };

  this.andFail = function (options = {}) {
    succeed = false;
    status = options.status || 500;
    if (options.response) {
      var errors = FactoryGuy.getFixtureBuilder().convertResponseErrors(options.response);
      responseJson = errors;
    }
    return this;
  };

  // for supporting older ( non chaining methods ) style of passing in options
  Ember.deprecate(
    `[ember-data-factory-guy] TestHelper.handleCreate - options.succeed has been deprecated.
      Use chainable methods with \`andFail()\` method instead`,
    !options.hasOwnProperty('succeed'),
    { id: 'ember-data-factory-guy.handle-create', until: '3.0.0' }
  );
  if (succeed) {
    this.calculate();
  } else {
    this.andFail(options);
  }

  var attributesMatch = function (requestData, expectedData) {
    // convert to json-api style data for standardization purposes
    var allMatch = true;
    if (!expectedData.data) {
      expectedData = store.normalize(modelName, expectedData);
    }
    if (!requestData.data && requestData[modelName]) {
      requestData = store.normalize(modelName, requestData[modelName]);
    }
    var expectedAttributes = expectedData.data.attributes;
    var requestedAttributes = requestData.data.attributes;
    for (var attribute in expectedAttributes) {
      if (expectedAttributes[attribute]) {
        // compare as strings for date comparison
        var requestAttribute = requestedAttributes[attribute].toString();
        var expectedAttribute = expectedAttributes[attribute].toString();
        if (requestAttribute !== expectedAttribute) {
          allMatch = false;
          break;
        }
      }
    }
    return allMatch;
  };

  /*
   Setting the id at the very last minute, so that calling calculate
   again and again does not mess with id, and it's reset for each call.
   */
  function modelId() {
    if (Ember.isPresent(returnArgs) && Ember.isPresent(returnArgs['id'])) {
      return returnArgs['id'];
    } else {
      var definition = FactoryGuy.findModelDefinition(modelName);
      return definition.nextId();
    }
  }

  this.handler = function(settings) {
    // need to clone the response since it could be used a few times in a row,
    // in a loop where you're doing createRecord of same model type
    var finalResponseJson = $.extend({}, true, responseJson);

    if (succeed) {
      if (matchArgs) {
        var requestData = JSON.parse(settings.data);
        if (!attributesMatch(requestData, expectedRequest)) {
          return false;
        }
      }
      this.status = 200;
      // Setting the id at the very last minute, so that calling calculate
      // again and again does not mess with id, and it's reset for each call
      finalResponseJson.id = modelId();
      finalResponseJson = FactoryGuy.getFixtureBuilder().convertForBuild(modelName, finalResponseJson);
    } else {
      this.status = status;
    }
    this.responseText = finalResponseJson;
  };

  var requestConfig = {
    url: url,
    dataType: 'json',
    type: 'POST',
    response: this.handler
  };

  $.mockjax(requestConfig);
};

export default MockCreateRequest;
