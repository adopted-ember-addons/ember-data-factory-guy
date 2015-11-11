import DS from 'ember-data';
import JSONAPIFixtureBuilder from './jsonapi-fixture-builder';
import RESTFixtureBuilder from './rest-fixture-builder';

var FixtureBuilderFactory = function (store, adapterFor) {

  var adapter = store.adapterFor(adapterFor || 'application');
  /*
   Using json api?
   TODO: extract this to utility class
   */
  this.useJSONAPI = function () {
    return usingJSONAPIAdapter();
  };
  var usingJSONAPIAdapter = function () {
    return adapter && adapter instanceof DS.JSONAPIAdapter;
  };
  var usingRESTAdapter = function () {
    return adapter && adapter instanceof DS.RESTAdapter;
  };
  /**
   Return appropriate FixtureBuilder for the adapter type
   */
  this.getFixtureBuilder = function () {
    if (usingJSONAPIAdapter()) {
      return new JSONAPIFixtureBuilder(store);
    }
    if (usingRESTAdapter()) {
      return new RESTFixtureBuilder(store);
    }
    return new JSONAPIFixtureBuilder(store);
  };
};

export default FixtureBuilderFactory;
