import MockFindRecordRequest from './mock-find-record-request';

export default class MockFindAllRequest extends MockFindRecordRequest {

  constructor(modelName) {
    super(modelName);
    this.setValidReturnsKeys(['models', 'json', 'ids','headers']);
    this.setResponseJson(this.fixtureBuilder.convertForBuild(modelName, []));
  }

}