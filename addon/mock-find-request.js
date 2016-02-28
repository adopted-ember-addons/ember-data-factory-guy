import FactoryGuy from './factory-guy';
import MockGetRequest from './mock-get-request';

let MockFindRequest = function (modelName) {
  MockGetRequest.call(this, modelName);

  this.setValidReturnsKeys(['model', 'json', 'id', 'headers']);
  let self = this;

  this.get = function(args) {
    let json = self.getResponseJson();
    if (json.get) { return json.get(args); }
  };

  this.getUrl = function() {
    return FactoryGuy.buildURL(modelName, self.get('id'));
  };
};

export default MockFindRequest;
