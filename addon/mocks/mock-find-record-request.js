import MockGetRequest from './mock-get-request';

export default class MockFindRecordRequest extends MockGetRequest {

  constructor(modelName) {
    super(modelName, 'findRecord');
    this.setValidReturnsKeys(['model', 'json', 'id', 'headers']);
  }
}