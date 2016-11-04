import RESTFixtureBuilder from './fixture-builder';
import ActiveModelFixtureConverter from '../converter/active-model-fixture-converter';
import RESTPayload from '../payload/rest-payload';
/**
 Fixture Builder for ActiveModelSerializer
 */
export default class ActiveModelFixtureBuilder extends RESTFixtureBuilder {
  constructor(store) {
    super(store, ActiveModelFixtureConverter, RESTPayload);
  }

  /**
   ActiveModelAdapter converts them automatically for status 422

   @param errors
   @returns {*}
   */
  convertResponseErrors(errors, status) {
    if (status === 422) {
      return errors;
    } else {
      return super.convertResponseErrors(errors, status);
    }
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

