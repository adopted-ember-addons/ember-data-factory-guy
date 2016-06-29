import MockFindRequest from './mock-find-request';

export default class MockReloadRequest extends MockFindRequest {

  constructor(modelName) {
    super(modelName);
    this.setValidReturnsKeys(['attrs','json','headers']);
  }
}