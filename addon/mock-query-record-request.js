import FactoryGuy from './factory-guy';
import MockQueryRequest from './mock-query-request';

let MockQueryRecordRequest = function(url, modelName, queryParams={}) {
  MockQueryRequest.call(this, url, modelName, queryParams);

  this.setResponseJson(FactoryGuy.getFixtureBuilder().convertForBuild(modelName, {}));
  this.setValidReturnsKeys(['model', 'json', 'id', 'headers']);
};

export default MockQueryRecordRequest;