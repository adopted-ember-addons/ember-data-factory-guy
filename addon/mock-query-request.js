import FactoryGuy from './factory-guy';
import { isEquivalent } from './utils/helper-functions';
import MockGetRequest from './mock-get-request';

let MockQueryRequest = function(modelName, queryParams = {}) {
  MockGetRequest.call(this, modelName);

  this.setResponseJson(FactoryGuy.getFixtureBuilder().convertForBuild(modelName, []));
  this.setValidReturnsKeys(['models', 'json', 'ids', 'headers']);

  let currentQueryParams = queryParams;

  this.withParams = function(queryParams) {
    currentQueryParams = queryParams;
    return this;
  };

  this.paramsMatch = function(settings) {
    return isEquivalent(currentQueryParams, settings.data);
  };

};

export default MockQueryRequest;
