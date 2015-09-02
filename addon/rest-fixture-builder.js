import FixtureBuilder from './fixture-builder';
import RESTFixtureConverter from './rest-fixture-converter';

/**
 Fixture Builder for REST based Serializer, like ActiveModelSerializer or
  RESTSerializer

 */
var RESTFixtureBuilder = function(store) {
  FixtureBuilder.call(this, store);
  /**
   Convert to the ember-data REST adapter specification

   @param {String} modelName
   @param {String} fixture
   @returns {*} new converted fixture
   */
  this.convertForBuild = function(modelName, fixture) {
    return new RESTFixtureConverter(store).convert(modelName, fixture);
  };
};

export default RESTFixtureBuilder;