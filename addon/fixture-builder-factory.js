import DS from 'ember-data';
import JSONAPIFixtureBuilder from './jsonapi-fixture-builder';
import AmsFixtureBuilder from './ams-fixture-builder';
import RESTFixtureBuilder from './rest-fixture-builder';

var FixtureBuilderFactory = function (store) {
  var adapter = store.adapterFor('application');
  /*
   Use JSONAPI Builder
 */
  this.useJSONAPI = function () {
    var useJSONAPI = usingJSONAPIAdapter();
    var isAMS = (usingActiveModelAdapter());
    var isREST = (usingRESTAdapter()) && !useJSONAPI;
    return !isAMS && !isREST;
  };
  var usingAdapterType = function (adapterType) {
    return DS[adapterType] && adapter instanceof DS[adapterType];
  };
  var usingJSONAPIAdapter = function () {
    return usingAdapterType('JSONAPIAdapter');
  };
  var usingActiveModelAdapter = function () {
    return usingAdapterType('ActiveModelAdapter');
  };
  var usingRESTAdapter = function () {
    return usingAdapterType('RESTAdapter');
  };
  this.getFixtureBuilder = function() {
    //console.log('usingActiveModelAdapter()', usingActiveModelAdapter(), adapter+'', adapter instanceof DS['ActiveModelAdapter'])
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