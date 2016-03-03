import FactoryGuy from './factory-guy';
import MockFindRequest from './mock-find-request';

export default class MockFindAllRequest extends MockFindRequest {

  constructor(modelName) {
    super(modelName);
    this.setValidReturnsKeys('models json ids headers'.w());
    this.setResponseJson(FactoryGuy.getFixtureBuilder().convertForBuild(modelName, []));
  }

}