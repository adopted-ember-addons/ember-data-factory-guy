import JSONFixtureBuilder from './fixture-builder';
import DRFFixtureConverter from '../converter/drf-fixture-converter';
import DRFPayload from '../payload/drf-payload';
/**
 Fixture Builder for DjangoRESTSerializer
 */
export default class DRFFixtureBuilder extends JSONFixtureBuilder {
  constructor(store) {
    super(store, DRFFixtureConverter, DRFPayload);
  }

  /**
   DRFAdapter converts the errors to a JSONAPI error format for you,
   but the error HAS to have a status of 400 .. but WHY?

   @param errors
   @returns {*}
   */
  convertResponseErrors(errors, status) {
    if (status === 400) {
      return errors;
    } else {
      return super.convertResponseErrors(errors, status);
    }
  }

}

