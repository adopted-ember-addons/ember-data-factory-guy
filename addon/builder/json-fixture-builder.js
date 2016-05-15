import FixtureBuilder from './fixture-builder';
import JSONFixtureConverter from '../converter/json-fixture-converter';
import JSONPayload from '../payload/json-payload';
/**
 Fixture Builder for JSONSerializer

 */
class JSONFixtureBuilder extends FixtureBuilder {
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
  normalize(_, payload) {
    return payload;
  }
  /**
   Convert to the ember-data REST adapter specification

   @param {String} modelName
   @param {String} fixture
   @returns {*} new converted fixture
   */
  convertForBuild(modelName, fixture) {
    let converter = new JSONFixtureConverter(this.store);
    let json = converter.convert(modelName, fixture);
    new JSONPayload(modelName, json, converter);
    return json;
  }
}

export default JSONFixtureBuilder;
