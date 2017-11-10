import MockRequest from 'mock-request';

export default class MockAnyRequest extends MockRequest {

  constructor({type, url, responseText}) {
    this.responseText = responseText;
    this.url = url;
    this.type = type;
  }

  getUrl() {
    return this.url;
  }

  getType() {
    return this.type;
  }

  getResponse() {
    return [200, {}, JSON.stringify(this.responseText)];
  }

  matches() {
    if (this.isDisabled) {
      return false;
    }

    this.timesCalled++;

    return true;
  }
}