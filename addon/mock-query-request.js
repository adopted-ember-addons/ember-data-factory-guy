import Ember from 'ember';
import FactoryGuy from './factory-guy';
import $ from 'jquery';

// compare to object for loose equality
function isEquivalent(a, b) {
  let aProps = Object.keys(a);
  let bProps = Object.keys(b);

  if (aProps.length !== bProps.length) {
    return false;
  }

  for (let i = 0; i < aProps.length; i++) {
    let propName = aProps[i];
    let aEntry = a[propName];
    let bEntry = b[propName];
    if (Ember.typeOf(aEntry) === 'object' && Ember.typeOf(bEntry) === 'object') {
      return isEquivalent(aEntry, bEntry);
    }

    if (a[propName] !== b[propName]) {
      return false;
    }
  }
  return true;
}

let MockQueryRequest = function (url, modelName, queryParams) {
  let succeed = true;
  let status = 200;
  let responseJson = FactoryGuy.getFixtureBuilder().convertForBuild(modelName, []);
  let errors = {};
  let currentQueryParams = queryParams;

  this.withParams = function (queryParams) {
    currentQueryParams = queryParams;
    return this;
  };

  this.returnsModels = function (models) {
    if (models) {
      Ember.assert('argument ( models ) must be an array - found type:' + Ember.typeOf(models), Ember.typeOf(models) === 'array');
    } else {
      models = [];
    }

    let json = models.map(function (model) {
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
    let store = FactoryGuy.get('store');
    let models = ids.map(function (id) {
      return store.peekRecord(modelName, id);
    });
    this.returnsModels(models);
    return this;
  };

  // TODO .. test this is working
  this.andFail = function (options={}) {
    succeed = false;
    status = options.status || 500;
    if (options.response) {
      errors = FactoryGuy.getFixtureBuilder().convertResponseErrors(options.response);
    }
    return this;
  };

  let handler = function (settings) {
    if (settings.url === url && settings.type === "GET") {
      if (succeed) {
        if (currentQueryParams) {
          if (!isEquivalent(currentQueryParams, settings.data)) {
            return false;
          }
        }
        return {status: 200, responseText: responseJson};
      } else {
        return {status: status, responseText: errors};
      }
    } else {
      return false;
    }
  };

  $.mockjax(handler);
};

export default MockQueryRequest;
