import MockQueryRequest from './mock-query-request';

export default class MockQueryRecordRequest extends MockQueryRequest {

  /**
   * By default this query will return a payload of 'null' or no result
   * 
   * @param modelName
   * @param queryParams
   */
  constructor(modelName, queryParams={}) {
    super(modelName, queryParams);
    this.setResponseJson(this.fixtureBuilder.convertForBuild(modelName, null));
    this.setValidReturnsKeys(['model','json','id','headers']);
  }
}