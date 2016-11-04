import FixtureBuilder from './fixture-builder';
import JSONFixtureConverter from '../converter/json-fixture-converter';
import JSONPayload from '../payload/json-payload';
/**
 Fixture Builder for JSONSerializer

 */
export default class JSONFixtureBuilder extends FixtureBuilder {
  constructor(store) {
    super(store, JSONFixtureConverter, JSONPayload);
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
}