import MockRequest from './mock-request';
import {
  isEmptyObject, isEquivalent, isPartOf, paramsFromRequestBody, toGetParams, toParams
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
    if (!isEmptyObject(this.someQueryParams)) {
      return this._tryMatchParams(request, this.someQueryParams, isPartOf);
    }

    if (!isEmptyObject(this.queryParams)) {
      return this._tryMatchParams(request, this.queryParams, isEquivalent);
    }

    return true;
  }

  _tryMatchParams(request, handlerParams, comparisonFunction) {
    if (this.type === 'GET') {
      return comparisonFunction(toGetParams(request.queryParams), toGetParams(handlerParams));
    }

    if (/POST|PUT|PATCH/.test(this.type)) {
      const requestBody   = request.requestBody,
            requestParams = paramsFromRequestBody(requestBody);
      return comparisonFunction(requestParams, toParams(handlerParams));
    }

    return false;
  }

}
