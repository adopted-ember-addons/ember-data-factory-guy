import MockGetRequest from './mock-get-request';

export default class MockQueryRequest extends MockGetRequest {
  /**
   * By default this query will return a payload of [] or empty array
   *
   * @param modelName
   * @param queryParams
   */
  constructor(modelName, queryParams = {}) {
    super(modelName, 'query', { defaultResponse: [], queryParams });
    this.setValidReturnsKeys(['models', 'json', 'ids', 'headers']);
  }
}
