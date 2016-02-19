import Ember from 'ember';
import FixtureBuilder from './fixture-builder';
import RESTFixtureConverter from './rest-fixture-converter';
/**
 Fixture Builder for REST based Serializer, like ActiveModelSerializer or
  RESTSerializer

 */
var RESTFixtureBuilder = function(store) {
  FixtureBuilder.call(this, store);
  /**
   Map single object to response json.

   Allows custom serializing mappings and meta data to be added to requests.

   @param {String} modelName model name
   @param {Object} json Json object from record.toJSON
   @return {Object} responseJson
   */
  this.normalize = function(modelName, payload) {
    return {[modelName]: payload};
  };

  this.extractId = function(modelName, payload) {
    return Ember.get(payload, `${modelName}.id`);
  };

  /**
   Convert to the ember-data REST adapter specification

   @param {String} modelName
   @param {String} fixture
   @returns {*} new converted fixture
   */
  this.convertForBuild = function(modelName, fixture) {
    let json = new RESTFixtureConverter(store).convert(modelName, fixture);
    json.unwrap = ()=> { return json[Object.getOwnPropertyNames(json)[0]]; };
    return json;
  };
};

export default RESTFixtureBuilder;
