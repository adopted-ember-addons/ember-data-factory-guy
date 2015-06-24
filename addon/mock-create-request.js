import FactoryGuy from './factory-guy';
import Ember from 'ember';
import $ from 'jquery';

var MockCreateRequest = function(url, store, modelName, options) {
  var status = options.status;
  var succeed = options.succeed === undefined ? true : options.succeed;
  var matchArgs = options.match;
  var returnArgs = options.returns;
  var responseJson = {};
  var expectedRequest = {};
  var modelType = store.modelFor(modelName);
  var thenCallback = function() {};

  this.calculate = function() {
    if (matchArgs) {
      // Using this technique to get properly serialized payload.
      // Although it's not ideal to have to create and delete a record,
      // TODO: Figure out how to use serializer without a record
      var tmpRecord = store.createRecord(modelName, matchArgs);
      expectedRequest = tmpRecord.serialize();
      tmpRecord.deleteRecord();
    }

    if (succeed) {
      responseJson[modelName] = $.extend({}, matchArgs, returnArgs);
      // Remove belongsTo associations since they will already be set when you called
      // createRecord, so they don't need to be returned.
      Ember.get(modelType, 'relationshipsByName').forEach(function (relationship) {
        if (relationship.kind === 'belongsTo') {
          delete responseJson[modelName][relationship.key];
        }
      });
    }
  };

  this.match = function(matches) {
    matchArgs = matches;
    this.calculate();
    return this;
  };

  this.andReturn = function(returns) {
    returnArgs = returns;
    this.calculate();
    return this;
  };

  this.then = function(callback) {
    thenCallback = callback;
  };

  this.andFail = function(options) {
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

  function modelId() {
    if (Ember.isPresent(returnArgs) && Ember.isPresent(returnArgs['id'])) {
      return returnArgs['id'];
    } else {
      var definition = FactoryGuy.modelDefinitions[modelName];
      return definition.nextId();
    }
  }

  this.handler = function(settings) {
    if (succeed) {
      if (matchArgs) {
        var requestData = JSON.parse(settings.data)[modelName];
        for (var attribute in expectedRequest) {
          if (expectedRequest[attribute] &&
              requestData[attribute] !== expectedRequest[attribute]) {
            return false;
          }
        }
      }
      this.status = 200;
      // Setting the id at the very last minute, so that calling calculate
      // again and again does not mess with id, and it's reset for each call
      responseJson[modelName].id = modelId();
    } else {
      this.status = status;
    }
    this.responseText = responseJson;
    thenCallback(responseJson);
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
