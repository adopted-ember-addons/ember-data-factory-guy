import MockGetRequest from './mock-get-request';

export default class MockQueryRequest extends MockGetRequest {

  /**
   * By default this query will return a payload of [] or empty array
   *
   * @param modelName
   * @param queryParams
   */
  constructor(modelName, queryParams = {}) {
    super(modelName, 'query');
    this.setResponseJson(this.fixtureBuilder.convertForBuild(modelName, []));
    this.setValidReturnsKeys(['models','json','ids','headers']);
    this.queryParams = queryParams;
  }
}
