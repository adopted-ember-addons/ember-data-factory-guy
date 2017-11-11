import MockRequest from './mock-request';

export default class MockAnyRequest extends MockRequest {

  constructor({type, url, responseText}) {
    super();
    this.responseJson = responseText;
    this.url = url;
    this.type = type;
    this.setupHandler();
  }

  getUrl() {
    return this.url;
  }

  getType() {
    return this.type;
  }
}