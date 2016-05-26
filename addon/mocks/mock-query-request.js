import Ember from 'ember';
import FactoryGuy from '../factory-guy';
import { isEquivalent } from '../utils/helper-functions';
import MockGetRequest from './mock-get-request';

export default class MockQueryRequest extends MockGetRequest {

  constructor(modelName, queryParams = {}) {
    super(modelName);
    this.setResponseJson(FactoryGuy.fixtureBuilder.convertForBuild(modelName, []));
    this.setValidReturnsKeys(['models','json','ids','headers']);
    this.currentQueryParams = queryParams;
  }

  withParams(queryParams) {
    this.currentQueryParams = queryParams;
    return this;
  }

  paramsMatch(settings) {
    if (Ember.$.isEmptyObject(this.currentQueryParams)) {
      return true;
    }
    return isEquivalent(this.currentQueryParams, settings.data);
  }

}
