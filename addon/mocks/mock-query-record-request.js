import MockQueryRequest from './mock-query-request';

export default class MockQueryRecordRequest extends MockQueryRequest {

  constructor(modelName, queryParams={}) {
    super(modelName, queryParams);
    this.setValidReturnsKeys(['model','json','id','headers']);
  }

}