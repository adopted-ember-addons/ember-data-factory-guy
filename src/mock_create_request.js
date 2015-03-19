var MockCreateRequest = function(url, store, modelName, options) {
  var status = options.status;
  var succeed = options.succeed === undefined ? true : options.succeed;
  var matchArgs = options.match;
  var returnArgs = options.returns;
  var responseJson = {};
  var expectedRequest = {};
  var modelType = store.modelFor(modelName);

  this.calculate = function() {
    if (matchArgs) {
      // although not ideal to create and delete a record, using this technique to
      // get properly serialized payload.
      // TODO: Need to figure out how to use serializer without a record
      var tmpRecord = store.createRecord(modelName, matchArgs);
      expectedRequest = tmpRecord.serialize(matchArgs);
      tmpRecord.deleteRecord();
    }

    if (succeed) {
      var definition = FactoryGuy.modelDefinitions[modelName];
      // If already calculated once, keep the same id
      var id = responseJson[modelName] ? responseJson[modelName].id : definition.nextId();
      responseJson[modelName] = $.extend({id: id}, matchArgs, returnArgs);
      // Remove belongsTo associations since they will already be set when you called
      // createRecord, so they don't need to be returned.
      Ember.get(modelType, 'relationshipsByName').forEach(function (relationship) {
        if (relationship.kind == 'belongsTo') {
          delete responseJson[modelName][relationship.key];
        }
      })
    } else {
      this.andFail(options);
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

  this.andFail = function(options) {
    options = options || {}
 		succeed = false;
 		status = options.status || 500;
    if (options.response) {
      responseJson = options.response;
    }
 		return this;
 	};

  this.handler = function(settings) {
    if (succeed) {
      if (matchArgs) {
        var requestData = JSON.parse(settings.data)[modelName];
        for (var attribute in expectedRequest) {
          if (expectedRequest[attribute] &&
              requestData[attribute] != expectedRequest[attribute]) {
            return false;
          }
        }
      }
      this.status = 200;
    } else {
      this.status = status;
    }
    this.responseText = responseJson;
  };

  this.calculate();

  var requestConfig = {
 		url: url,
 		dataType: 'json',
 		type: 'POST',
 		response: this.handler
 	};

  $.mockjax(requestConfig);
};
