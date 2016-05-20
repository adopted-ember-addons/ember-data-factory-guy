import FixtureBuilder from './fixture-builder';
import JSONAPIFixtureConverter from '../converter/jsonapi-fixture-converter';
import JSONAPIPayload from '../payload/json-api-payload';

/**
 Fixture Builder for JSONAPISerializer
 */
export default class extends FixtureBuilder {

  constructor(store) {
    super(store);
    this.updateHTTPMethod = 'PATCH';
  }
  /**
   Convert to the ember-data JSONAPI Serializer specification

   @param {String} modelName
   @param {String} fixture
   @returns {*} new converted fixture
   */
  convertForBuild(modelName, fixture) {
    let converter = new JSONAPIFixtureConverter(this.store);
    let json =  converter.convert(modelName, fixture);
    new JSONAPIPayload(modelName, json, converter);
    return json;
  }
}