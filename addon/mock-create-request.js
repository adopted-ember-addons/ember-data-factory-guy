import FactoryGuy from './factory-guy';
import Ember from 'ember';
import $ from 'jquery';

var MockCreateRequest = function (url, store, modelName, options) {
  var status = options.status;
  var succeed = options.succeed === undefined ? true : options.succeed;
  var matchArgs = options.match;
  var returnArgs = options.returns;
  var responseJson = {};
  var expectedRequest = {};
  var modelClass = store.modelFor(modelName);

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
      responseJson[modelName] = $.extend({}, matchArgs, returnArgs);
      console.log('responseJson[modelName]', responseJson[modelName]);
      // Remove belongsTo associations since they will already be set when you called
      // createRecord, so they don't need to be returned.
      Ember.get(modelClass, 'relationshipsByName').forEach(function (relationship) {
        if (relationship.kind === 'belongsTo') {
          delete responseJson[modelName][relationship.key];
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

  this.andFail = function (options) {
    options = options || {};
    succeed = false;
    status = options.status || 500;
    if (options.response) {
      responseJson = options.response;
    }
    return this;
  };

  // for supporting older ( non chaining methods ) style of passing in options
  if (succeed) {
    this.calculate();
  } else {
    this.andFail(options);
  }

  var attributesMatch = function (requestData, expectedData) {
    // convert to json-api style data for standardization purposes
    if (!expectedData.data) {
      expectedData = store.normalize(modelName, expectedData).data;
    }
    if (!requestData.data && requestData[modelName]) {
      requestData = store.normalize(modelName, requestData[modelName]).data;
    }
    //console.log('requestData',requestData.attributes)
    //console.log('expectedData',expectedData.attributes)
    for (var attribute in expectedData.attributes) {
      if (expectedData.attributes[attribute]) {
        // compare as strings for date comparison
        //console.log(attribute, expectedData.attributes[attribute].toString(), requestData.attributes[attribute].toString(), requestData.attributes[attribute].toString() === expectedData.attributes[attribute].toString())
        if (requestData.attributes[attribute].toString() !== expectedData.attributes[attribute].toString()) {
          return false;
        }
      }
    }
    return true;
  };

  this.handler = function (settings) {
    if (succeed) {
      if (matchArgs) {
        var requestData = JSON.parse(settings.data);
        //console.log('requestData', requestData);
        //console.log('expectedRequest', expectedRequest);
        if (!attributesMatch(requestData, expectedRequest)) {
          return false;
        }
      }
      this.status = 200;
      // Setting the id at the very last minute, so that calling calculate
      // again and again does not mess with id, and it's reset for each call
      var definition = FactoryGuy.findModelDefinition(modelName);
      var id = definition.nextId();
      responseJson[modelName].id = id;
    } else {
      this.status = status;
    }
    this.responseText = responseJson;
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
