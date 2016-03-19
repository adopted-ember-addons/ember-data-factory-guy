import Ember from 'ember';
import FixtureBuilder from './fixture-builder';
import RESTFixtureConverter from '../converter/rest-fixture-converter';
import RESTPayload from '../payload/rest-payload';
/**
 Fixture Builder for REST based Serializer, like ActiveModelSerializer or
 RESTSerializer

 */
class RESTFixtureBuilder extends FixtureBuilder {
  constructor(store) {
    super(store);
  }
  /**
   Map single object to response json.

   Allows custom serializing mappings and meta data to be added to requests.

   @param {String} modelName model name
   @param {Object} json Json object from record.toJSON
   @return {Object} responseJson
   */
  normalize(modelName, payload) {
    return { [modelName]: payload };
  }

  extractId(modelName, payload) {
    return Ember.get(payload, `${modelName}.id`);
  }

  /**
   Convert to the ember-data REST adapter specification

   @param {String} modelName
   @param {String} fixture
   @returns {*} new converted fixture
   */
  convertForBuild(modelName, fixture) {
    let converter = new RESTFixtureConverter(this.store);
    let json = converter.convert(modelName, fixture);
    new RESTPayload(modelName, json, converter);
    return json;
  }
}

export default RESTFixtureBuilder;
