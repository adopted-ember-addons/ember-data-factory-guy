import MockRequest from './mock-request';

export default class MockAnyRequest extends MockRequest {

  constructor({type = 'GET', url, responseText, status = 200}) {
    super();
    this.responseJson = responseText;
    this.url = url;
    this.type = type;
    this.status = status;
    this.setupHandler();
  }

  getUrl() {
    return this.url;
  }

  getType() {
    return this.type;
  }

}