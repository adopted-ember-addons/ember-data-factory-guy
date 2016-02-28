import MockQueryRequest from './mock-query-request';

let MockQueryRecordRequest = function(modelName, queryParams={}) {
  MockQueryRequest.call(this, modelName, queryParams);

  this.setValidReturnsKeys(['model', 'json', 'id', 'headers']);
};

export default MockQueryRecordRequest;