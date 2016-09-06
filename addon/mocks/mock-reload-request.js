import MockFindRecordRequest from './mock-find-record-request';

export default class MockReloadRequest extends MockFindRecordRequest {

  constructor(modelName) {
    super(modelName);
    this.setValidReturnsKeys(['attrs','json','headers']);
  }
  
}