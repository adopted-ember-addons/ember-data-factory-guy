import FactoryGuy from './factory-guy';
import MockFindRequest from './mock-find-request';

let MockFindAllRequest = function (modelName) {
  MockFindRequest.call(this, modelName);

  this.setValidReturnsKeys(['models', 'json', 'ids', 'headers']);

  this.getUrl = function() {
    return FactoryGuy.buildURL(modelName);
  };
};

export default MockFindAllRequest;