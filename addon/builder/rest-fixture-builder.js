import FixtureBuilder from './fixture-builder';
import RESTFixtureConverter from '../converter/rest-fixture-converter';
import RESTPayload from '../payload/rest-payload';
/**
 Fixture Builder for REST based Serializer, like ActiveModelSerializer or
 RESTSerializer

 */
export default class RESTFixtureBuilder extends FixtureBuilder {

  constructor(store) {
    super(store, RESTFixtureConverter, RESTPayload);
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
}