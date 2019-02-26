import MockRequest from './mock-request';
import {
  isEmptyObject, isEquivalent, paramsFromRequestBody, toGetParams, toParams
} from "../utils/helper-functions";

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

  paramsMatch(request) {
    if (!isEmptyObject(this.queryParams)) {
      if (this.type === 'GET') {
        return isEquivalent(toGetParams(request.queryParams), toGetParams(this.queryParams));
      }
      if (/POST|PUT|PATCH/.test(this.type)) {

        const requestBody   = request.requestBody,
              requestParams = paramsFromRequestBody(requestBody);

        return isEquivalent(requestParams, toParams(this.queryParams));
      }
    }
    return true;
  }
}
