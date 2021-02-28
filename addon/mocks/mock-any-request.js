import MockRequest from './mock-request';
import {
  isEmptyObject, isEquivalent, isPartOf, paramsFromRequestBody, toParams
} from "../utils/helper-functions";

export default class MockAnyRequest extends MockRequest {

  constructor({type = 'GET', url, responseText, status = 200}) {
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
    let requestParams = request.queryParams;

    if (/POST|PUT|PATCH/.test(this.type)) {
      requestParams = paramsFromRequestBody(request.requestBody);
    }
    return comparisonFunction(toParams(requestParams), toParams(handlerParams));
  }

}
