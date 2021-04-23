import MockGetRequest from './mock-get-request';

export default class MockFindAllRequest extends MockGetRequest {
  constructor(modelName) {
    super(modelName, 'findAll', { defaultResponse: [] });
    this.setValidReturnsKeys(['models', 'json', 'ids', 'headers']);
  }
}
