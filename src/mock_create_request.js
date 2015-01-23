var MockCreateRequest = function(url, store, modelName, options) {
  var succeed = options.succeed === undefined ? true : options.succeed;
  var matchArgs = options.match;
  var returnArgs = options.returns;
  var responseJson = {};
  var expectedRequest = {};
  var modelType = store.modelFor(modelName);

  this.calculate = function() {
    if (matchArgs) {
      var tmpRecord = store.createRecord(modelName, matchArgs);
      expectedRequest = tmpRecord.serialize(matchArgs);
      tmpRecord.deleteRecord();
    }

    if (succeed) {
      var definition = FactoryGuy.modelDefinitions[modelName];
      if (responseJson[modelName]) {
        // already calculated once, keep the same id
        responseJson[modelName] = $.extend({id: responseJson[modelName].id}, matchArgs, returnArgs);
      } else {
        responseJson[modelName] = $.extend({id: definition.nextId()}, matchArgs, returnArgs);
      }
      // Remove belongsTo associations since they will already be set when you called
      // createRecord, so they don't need to be returned.
      Ember.get(modelType, 'relationshipsByName').forEach(function (relationship) {
        if (relationship.kind == 'belongsTo') {
          delete responseJson[modelName][relationship.key];
        }
      })
    }

  }

  this.match = function(matches) {
    matchArgs = matches;
    this.calculate();
    return this;
  }

  this.andReturn = function(returns) {
    returnArgs = returns;
    this.calculate();
    return this;
  }

  this.andFail = function() {
    succeed = false;
    return this;
  }

  this.handler = function(settings) {
    if (settings.url != url || settings.type != 'POST') { return false}

    if (matchArgs) {
      var requestData = JSON.parse(settings.data)[modelName];
      for (attribute in expectedRequest) {
        if (expectedRequest[attribute] &&
            requestData[attribute] != expectedRequest[attribute]) {
          return false
        }
      }
    }
    var responseStatus = (succeed ? 200: 500);
    return {
      responseText: responseJson,
      status: responseStatus
    };
  }

  this.calculate();

  $.mockjax(this.handler);
};
