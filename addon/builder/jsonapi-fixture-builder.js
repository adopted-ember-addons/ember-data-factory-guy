import FixtureBuilder from './fixture-builder';
import JSONAPIFixtureConverter from '../converter/jsonapi-fixture-converter';
import JSONAPIPayload from '../payload/json-api-payload';

/**
 Fixture Builder for JSONAPISerializer
 */
export default class JSONAPIFixtureBuilder extends FixtureBuilder {

  constructor(store) {
    super(store, JSONAPIFixtureConverter, JSONAPIPayload);
    this.updateHTTPMethod = 'PATCH';
  }
}