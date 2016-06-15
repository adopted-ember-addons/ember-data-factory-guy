import FactoryGuy from '../factory-guy';
import MockGetRequest from './mock-get-request';

export default class MockFindRequest extends MockGetRequest {

  constructor(modelName) {
    super(modelName);
    this.setValidReturnsKeys(['model', 'json', 'id', 'headers']);
  }

  getUrl() {
    return FactoryGuy.buildURL(this.modelName, this.get('id'));
  }
}