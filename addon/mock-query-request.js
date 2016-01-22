import Ember from 'ember';
import FactoryGuy from './factory-guy';
import $ from 'jquery';

// compare to object for loose equality
function isEquivalent(a, b) {
  var aProps = Object.keys(a);
  var bProps = Object.keys(b);

  if (aProps.length !== bProps.length) {
    return false;
  }

  for (var i = 0; i < aProps.length; i++) {
    var propName = aProps[i];
    var aEntry = a[propName];
    var bEntry = b[propName];
    if (Ember.typeOf(aEntry) === 'object' && Ember.typeOf(bEntry) === 'object') {
      return isEquivalent(aEntry, bEntry);
    }

    if (a[propName] !== b[propName]) {
      return false;
    }
  }
  return true;
}

var MockQueryRequest = function (url, modelName, queryParams) {
  var succeed = true;
  var status = 200;
  var responseJson = FactoryGuy.getFixtureBuilder().convertForBuild(modelName, []);
  var errors = {};
  var currentQueryParams = queryParams;

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
    var store = FactoryGuy.get('store');
    var models = ids.map(function (id) {
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

  var handler = function (settings) {
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
