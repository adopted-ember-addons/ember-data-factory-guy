import Ember from 'ember';
import FactoryGuy from './factory-guy';
import $ from 'jquery';

var MockQueryRequest = function (url, modelName, queryParams) {
  var succeed = true;
  var status = 200;
  var responseJson = FactoryGuy.getFixtureBuilder().convertForBuild(modelName, []);
  var errors = {};

  this.returnsModels = function (models) {
    if (models) {
      Ember.assert('argument ( models ) must be an array - found type:' + Ember.typeOf(models), Ember.typeOf(models) === 'array');
    } else {
      models = [];
    }

    var json = models.map(function (model) {
      return {id: model.id, type: model.constructor.modelName};
    });

    responseJson = FactoryGuy.getFixtureBuilder().convertForBuild(modelName, json);

    return this;
  };

  this.returnsJSON = function (json) {
    responseJson = json;
    return this;
  };

  this.returnsExistingIds = function (ids) {
    var store = FactoryGuy.getStore();
    var models = ids.map( function(id) { return store.peekRecord(modelName,id); });
    this.returnsModels(models);
    return this;
  };

  // TODO .. test this is working
  this.andFail = function (options) {
    options = options || {};
    succeed = false;
    status = options.status || 500;
    if (options.response) {
      errors = FactoryGuy.getFixtureBuilder().convertResponseErrors(options.response);
    }
    return this;
  };


  this.handler = function(settings) {
    if (succeed) {
      if (queryParams) {
        if (JSON.stringify(queryParams) !== JSON.stringify(settings.data)) {
          return false;
        }
      }
      this.status = 200;
      this.responseText = responseJson;
    } else {
      this.status = status;
      this.responseText = errors;
    }
  };

  var requestConfig = {
    url: url,
    dataType: 'json',
    type: 'GET',
    data: queryParams,
    response: this.handler
  };

  $.mockjax(requestConfig);
};

export default MockQueryRequest;
