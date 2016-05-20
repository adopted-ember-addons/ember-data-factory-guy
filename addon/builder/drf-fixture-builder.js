import JSONFixtureBuilder from './fixture-builder';
import DRFFixtureConverter from '../converter/drf-fixture-converter';
import DRFPayload from '../payload/drf-payload';
/**
 Fixture Builder for DjangoRESTSerializer

 */
export default class extends JSONFixtureBuilder {
  /**
   Convert to the ember-data REST adapter specification

   @param {String} modelName
   @param {String} fixture
   @returns {*} new converted fixture
   */
  convertForBuild(modelName, fixture) {
    let converter = new DRFFixtureConverter(this.store);
    let json = converter.convert(modelName, fixture);
    new DRFPayload(modelName, json, converter);
    return json;
  }
}

