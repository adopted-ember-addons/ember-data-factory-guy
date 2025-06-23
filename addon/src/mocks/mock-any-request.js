import MockRequest from './mock-request';

export default class MockAnyRequest extends MockRequest {
  constructor({ type = 'GET', url, responseText, status = 200 }) {
    super();
    this.responseJson = responseText;
    if (this.isErrorStatus(status)) this.errorResponse = responseText;
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

  /**
   * Return some form of object
   *
   * @param json
   * @returns {*}
   */
  returns(json) {
    this.responseJson = json;
    return this;
  }

  async paramsMatch({ request, params }) {
    if (/POST|PUT|PATCH/.test(this.type)) {
      // compare to request body instead

      let requestBody;
      try {
        requestBody = await request.clone().text();
      } catch (e) {}
      try {
        requestBody = await request.clone().json();
      } catch (e) {}
      try {
        requestBody = await request.formData();
      } catch (e) {}

      return super.attributesMatch(
        requestBody,
        this.someQueryParams ?? this.queryParams ?? {},
      );
    } else {
      return super.paramsMatch({ request, params });
    }
  }
}
