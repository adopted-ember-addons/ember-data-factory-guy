import Ember from 'ember';
import FixtureBuilder from './fixture-builder';
import RESTFixtureConverter from './rest-fixture-converter';
import RESTJson from './rest-json';
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
    let json = (new RESTFixtureConverter(this.store)).convert(modelName, fixture);
    let proxy = new RESTJson(modelName, json);
    //json.proxy = proxy;
    json.get = (key)=>proxy.get(key);
    return json;
  }
}

export default RESTFixtureBuilder;
