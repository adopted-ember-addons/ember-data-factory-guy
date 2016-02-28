import MockFindRequest from './mock-find-request';

let MockFindAllRequest = function (modelName) {
  MockFindRequest.call(this, modelName);

  this.setValidReturnsKeys(['models', 'json', 'ids', 'headers']);
};

export default MockFindAllRequest;