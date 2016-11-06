import MockGetRequest from './mock-get-request';

export default class MockQueryRecordRequest extends MockGetRequest {

  /**
   * By default this query will return a payload of 'null' or no result
   * 
   * @param modelName
   * @param queryParams
   */
  constructor(modelName, queryParams={}) {
    super(modelName, 'queryRecord');
    this.setResponseJson(this.fixtureBuilder.convertForBuild(modelName, null));
    this.setValidReturnsKeys(['model','json','id','headers']);
    this.queryParams  = queryParams;
  }
}