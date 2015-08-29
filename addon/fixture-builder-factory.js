import JSONAPIFixtureBuilder from './jsonapi-fixture-builder';
import AmsFixtureBuilder from './ams-fixture-builder';
import RESTFixtureBuilder from './rest-fixture-builder';

var FixtureBuilderFactory = function (store) {
  var adapter = store.adapterFor('application');
  /*
   Using json api?
   TODO: extract this to utility class, and fix some of the whacky logic
   */
  this.useJSONAPI = function () {
    var useJSONAPI = usingJSONAPIAdapter();
    var isAMS = (usingActiveModelAdapter());
    var isREST = (usingRESTAdapter()) && !useJSONAPI;
    return !isAMS && !isREST;
  };
  var usingAdapterType = function (adapterType) {
    return adapter && adapter.toString().match(adapterType);
  };
  var usingJSONAPIAdapter = function () {
    return usingAdapterType('json-api');
  };
  var usingActiveModelAdapter = function () {
    return usingAdapterType('active-model');
  };
  var usingRESTAdapter = function () {
    return usingAdapterType('rest');
  };
  /**
   Return appropriate FixtureBuilder for the adapter type
   */
  this.getFixtureBuilder = function () {
    if (usingActiveModelAdapter()) {
      return new AmsFixtureBuilder(store);
    }
    if ((usingRESTAdapter()) && !usingJSONAPIAdapter()) {
      return new RESTFixtureBuilder(store);
    }
    return new JSONAPIFixtureBuilder(store);
  };
};


export default FixtureBuilderFactory;