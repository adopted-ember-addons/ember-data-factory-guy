import FactoryGuy from '../factory-guy';
import MockFindRecordRequest from './mock-find-record-request';

export default class MockFindAllRequest extends MockFindRecordRequest {

  constructor(modelName) {
    super(modelName);
    this.setValidReturnsKeys(['models', 'json', 'ids','headers']);
    this.setResponseJson(FactoryGuy.fixtureBuilder.convertForBuild(modelName, []));
  }

}