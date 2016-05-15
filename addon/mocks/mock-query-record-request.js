import FactoryGuy from '../factory-guy';
import MockQueryRequest from './mock-query-request';

export default class MockQueryRecordRequest extends MockQueryRequest {

  constructor(modelName, queryParams={}) {
    super(modelName, queryParams);
    this.setResponseJson(FactoryGuy.fixtureBuilder.convertForBuild(modelName, {}));
    this.setValidReturnsKeys(['model','json','id','headers']);
  }

}