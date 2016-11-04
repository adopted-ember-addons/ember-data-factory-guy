import FactoryGuy from '../factory-guy';
import MockGetRequest from './mock-get-request';

export default class MockQueryRequest extends MockGetRequest {

  constructor(modelName, queryParams = {}) {
    super(modelName);
    this.setResponseJson(FactoryGuy.fixtureBuilder.convertForBuild(modelName, []));
    this.setValidReturnsKeys(['models','json','ids','headers']);
    this.queryParams = queryParams;
  }

  getUrl() {
    return FactoryGuy.buildURL(this.modelName, null, 'query', this.queryParams);
  }
}
