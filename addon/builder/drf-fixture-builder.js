import JSONFixtureBuilder from './fixture-builder';
import DRFFixtureConverter from '../converter/drf-fixture-converter';
import DRFPayload from '../payload/drf-payload';
/**
 Fixture Builder for DjangoRESTSerializer
 */
export default class extends JSONFixtureBuilder {
  constructor(store) {
    super(store, DRFFixtureConverter, DRFPayload);
  }
}

