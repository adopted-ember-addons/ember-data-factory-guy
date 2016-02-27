import Ember from 'ember';
import DS from 'ember-data';
import FactoryGuy from './factory-guy';
import $ from 'jquery';
import { isEquivalent } from './utils/helper-functions';

let MockQueryRequest = function(url, modelName, queryParams) {
  let succeed = true;
  let status = 200;
  let responseJson = FactoryGuy.getFixtureBuilder().convertForBuild(modelName, []);
  let errors = {};
  let currentQueryParams = queryParams;

  this.withParams = function(queryParams) {
    currentQueryParams = queryParams;
    return this;
  };

  this.returns = function(args) {
    if (Ember.typeOf(args) === "array") {
      if (Ember.isEmpty(args) || args[0] instanceof DS.Model) {
       return this._returnsModels(args);
      } else {
        return this._returnsJSON(args);
      }
    }
    if (args instanceof DS.Model) {
      return this._returnsModel(args);
    } else {
      return this._returnsJSON(args);
    }
  };

  this._returnsModel = function(model) {
    let json = { id: model.id, type: model.constructor.modelName };
    responseJson = FactoryGuy.getFixtureBuilder().convertForBuild(modelName, json);
    return this;
  };

  this.returnsModel = function(model) {
    Ember.deprecate(`MockQueryRequest.returnsModel - has been deprecated.
        Use returns method instead`, false,
      { id: 'ember-data-factory-guy.returns-model', until: '2.4.0' });
    return this._returnsModel(model);
  };

  this._returnsModels = function(models) {
    if (models) {
      Ember.assert('argument ( models ) must be an array - found type:' + Ember.typeOf(models), Ember.typeOf(models) === 'array');
    } else {
      models = [];
    }

    let json = models.map(function(model) {
      return { id: model.id, type: model.constructor.modelName };
    });

    responseJson = FactoryGuy.getFixtureBuilder().convertForBuild(modelName, json);

    return this;
  };

  this.returnsModels = function(models) {
    Ember.deprecate(`MockQueryRequest.returnsModels - has been deprecated.
        Use returns method instead`, false,
      { id: 'ember-data-factory-guy.returns-models', until: '2.4.0' });
    return this._returnsModels(models);
  };

  this._returnsJSON = function(json) {
    responseJson = json;
    return this;
  };

  this.returnsJSON = function(json) {
    Ember.deprecate(`MockQueryRequest.returnsJSON - has been deprecated.
        Use returns method instead`, false,
      { id: 'ember-data-factory-guy.returns-json', until: '2.4.0' });
    return this._returnsJSON(json);
  };

  // TODO remove soon
  this.returnsExistingIds = function(ids) {
    Ember.deprecate(`MockQueryRequest.returnsExistingIds - has been deprecated.
        Use returns method instead and pass in models or json`, false,
      { id: 'ember-data-factory-guy.returns-json', until: '2.4.0' });

    let store = FactoryGuy.get('store');
    let models = ids.map(function(id) {
      return store.peekRecord(modelName, id);
    });
    return this._returnsModels(models);
  };

  // TODO .. test this is working
  this.andFail = function(options = {}) {
    succeed = false;
    status = options.status || 500;
    if (options.response) {
      errors = FactoryGuy.getFixtureBuilder().convertResponseErrors(options.response);
    }
    return this;
  };

  let handler = function(settings) {
    if (settings.url === url && settings.type === "GET") {
      if (succeed) {
        if (currentQueryParams) {
          if (!isEquivalent(currentQueryParams, settings.data)) {
            return false;
          }
        }
        return { status: 200, responseText: responseJson };
      } else {
        return { status: status, responseText: errors };
      }
    } else {
      return false;
    }
  };

  $.mockjax(handler);
};

export default MockQueryRequest;
