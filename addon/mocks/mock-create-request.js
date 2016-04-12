import Ember from 'ember';
import FactoryGuy from '../factory-guy';
import $ from 'jquery';

let MockCreateRequest = function (url, modelName, options) {
  let status = options.status;
  let succeed = options.succeed === undefined ? true : options.succeed;
  let matchArgs = options.match;
  let returnArgs = options.returns;
  let responseJson = {};
  let expectedRequest = {};
  let store = FactoryGuy.store;

  this.calculate = function () {
    if (matchArgs) {
      // Using this technique to get properly serialized payload.
      // Although it's not ideal to have to create and delete a record,
      // TODO: Figure out how to use serializer without a record instance
      let tmpRecord = store.createRecord(modelName, matchArgs);
      expectedRequest = tmpRecord.serialize();
      tmpRecord.deleteRecord();
    }

    if (succeed) {
      let modelClass = store.modelFor(modelName);
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

  this.returns = function (returns) {
    returnArgs = returns;
    this.calculate();
    return this;
  };

  this.andReturn = function (returns) {
    Ember.deprecate(
      `[ember-data-factory-guy] mockCreate.andReturn method has been deprecated.
        Use chainable method \`returns()\` instead`,
      !options.hasOwnProperty('succeed'),
      { id: 'ember-data-factory-guy.handle-create-and-return', until: '2.4.0' }
    );
    return this.returns(returns);
  };

  this.andFail = function(options = {}) {
    Ember.deprecate("`andFail` - has been deprecated. Use `fails(options)` method instead`",
      false, { id: 'ember-data-factory-guy.and-fail', until: '2.4.0' });
    return this.fails(options);
  };

  this.fails = function (options = {}) {
    succeed = false;
    status = options.status || 500;
    if (options.response) {
      let errors = FactoryGuy.fixtureBuilder.convertResponseErrors(options.response);
      responseJson = errors;
    }
    return this;
  };

  // for supporting older ( non chaining methods ) style of passing in options
  Ember.deprecate(
    `[ember-data-factory-guy] TestHelper.mockCreate - options.succeed has been deprecated.
      Use chainable method \`andFail()\` instead`,
    !options.hasOwnProperty('succeed'),
    { id: 'ember-data-factory-guy.handle-create-succeed-options', until: '2.4.0' }
  );
  Ember.deprecate(
    `[ember-data-factory-guy] TestHelper.mockCreate - options.match has been deprecated.
      Use chainable method \`match()\` instead`,
    !options.hasOwnProperty('match'),
    { id: 'ember-data-factory-guy.handle-create-match-options', until: '2.4.0' }
  );
  Ember.deprecate(
    `[ember-data-factory-guy] TestHelper.mockCreate - options.returns has been deprecated.
      Use chainable method \`returns()\` instead`,
    !options.hasOwnProperty('returns'),
    { id: 'ember-data-factory-guy.handle-create-returns-options', until: '2.4.0' }
  );
  if (succeed) {
    this.calculate();
  } else {
    this.fails(options);
  }

  let attributesMatch = function (requestData, expectedData) {
    // convert to json-api style data for standardization purposes
    let allMatch = true;
    if (!expectedData.data) {
      expectedData = store.normalize(modelName, expectedData);
    }
    if (!requestData.data) {
      const serializer = store.serializerFor(modelName);
      const transformedModelKey = serializer.payloadKeyFromModelName(modelName);
      if (requestData[transformedModelKey]) {
        requestData = store.normalize(modelName, requestData[transformedModelKey]);
      }
    }
    let expectedAttributes = expectedData.data.attributes;
    let requestedAttributes = requestData.data.attributes;
    for (let attribute in expectedAttributes) {
      if (expectedAttributes[attribute]) {
        // compare as strings for date comparison
        let requestAttribute = requestedAttributes[attribute].toString();
        let expectedAttribute = expectedAttributes[attribute].toString();
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
      let definition = FactoryGuy.findModelDefinition(modelName);
      return definition.nextId();
    }
  }

  this.handler = function(settings) {
    // need to clone the response since it could be used a few times in a row,
    // in a loop where you're doing createRecord of same model type
    let finalResponseJson = $.extend({}, true, responseJson);

    if (succeed) {
      if (matchArgs) {
        let requestData = JSON.parse(settings.data);
        if (!attributesMatch(requestData, expectedRequest)) {
          return false;
        }
      }
      this.status = 200;
      // Setting the id at the very last minute, so that calling calculate
      // again and again does not mess with id, and it's reset for each call
      finalResponseJson.id = modelId();
      finalResponseJson = FactoryGuy.fixtureBuilder.convertForBuild(modelName, finalResponseJson);
    } else {
      this.status = status;
    }
    this.responseText = finalResponseJson;
  };

  let requestConfig = {
    url: url,
    dataType: 'json',
    type: 'POST',
    response: this.handler
  };

  $.mockjax(requestConfig);
};

export default MockCreateRequest;
