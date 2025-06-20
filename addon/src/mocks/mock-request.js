import { assert } from '@ember/debug';
import { typeOf } from '@ember/utils';
import {
  isEmptyObject,
  isEquivalent,
  isPartOf,
  param,
  toParams,
} from '../utils/helper-functions';
import FactoryGuy from '../factory-guy';

export default class {
  constructor() {
    this.status = 200;
    this.responseHeaders = {};
    this.responseJson = null;
    this.errorResponse = null;
    this.isDisabled = false;
    this.isDestroyed = false;
    this.timesCalled = 0;
  }

  /**
   * Set the adapter options that this mockCreate will be using
   *
   * @param {Object} options adapterOptions
   */
  withAdapterOptions(options) {
    this.adapterOptions = options;
    this.setupHandler();
    return this;
  }

  /**
   */
  get() {}

  /**
   * @returns {String}
   */
  getUrl() {}

  getType() {
    return 'GET';
  }

  returns(/*options = {}*/) {}

  addResponseHeaders(headers) {
    Object.assign(this.responseHeaders, headers);
  }

  succeeds(opts = {}) {
    this.status = opts.status || 200;
    this.errorResponse = null;
    return this;
  }

  isErrorStatus(status) {
    return !!status.toString().match(/^([345]\d{2})/);
  }

  fails(opts = {}) {
    let convertErrors = Object.prototype.hasOwnProperty.call(
        opts,
        'convertErrors',
      )
        ? opts.convertErrors
        : true,
      status = opts.status || 500,
      response = opts.response || null;
    assert(
      `[ember-data-factory-guy] 'fails' method status code must be 3XX, 4XX or 5XX,
        you are using: ${status}`,
      this.isErrorStatus(status),
    );

    this.status = status;
    this.errorResponse = response;

    if (response && convertErrors) {
      let errors = this.fixtureBuilder.convertResponseErrors(
        response,
        this.status,
      );
      this.errorResponse = errors;
    }

    return this;
  }

  // for a fails response, the response you might have set ( like a payload ) will
  // be discarded in favour of the error response that was built for you in fails method
  actualResponseJson() {
    let responseText = this.isErrorStatus(this.status)
      ? this.errorResponse
      : this.responseJson;
    return JSON.stringify(responseText);
  }

  getResponse() {
    return {
      responseText: this.actualResponseJson(),
      headers: this.responseHeaders,
      status: this.status,
    };
  }

  logInfo() {
    if (FactoryGuy.logLevel > 0) {
      const json = JSON.parse(this.getResponse().responseText),
        name = this.constructor.name.replace('Request', ''),
        type = this.getType(),
        status = `[${this.status}]`,
        url = this.getUrl();

      let fullUrl = url;
      if (!isEmptyObject(this.queryParams)) {
        fullUrl = [url, '?', param(this.queryParams)].join('');
      }

      const info = ['[factory-guy]', name, type, status, fullUrl, json];

      console.log(...info);
    }
  }

  withParams(queryParams) {
    this.queryParams = queryParams;
    return this;
  }

  hasQueryParams() {
    return !isEmptyObject(this.queryParams);
  }

  withSomeParams(someQueryParams) {
    this.someQueryParams = someQueryParams;
    return this;
  }

  paramsMatch(request) {
    if (!isEmptyObject(this.someQueryParams)) {
      return isPartOf(
        toParams(request.queryParams),
        toParams(this.someQueryParams),
      );
    }
    if (!isEmptyObject(this.queryParams)) {
      return isEquivalent(
        toParams(request.queryParams),
        toParams(this.queryParams),
      );
    }
    return true;
  }

  attributesMatch(requestBody, matchParams) {
    if (isEmptyObject(matchParams)) {
      return true;
    }
    return isPartOf(toParams(requestBody), toParams(matchParams));
  }

  extraRequestMatches(request) {
    if (this.matchArgs) {
      let requestBody = request.requestBody;
      if (typeOf(requestBody) === 'string') {
        requestBody = JSON.parse(requestBody);
      }
      if (typeOf(this.matchArgs) === 'function') {
        return this.matchArgs(requestBody);
      } else {
        return this.attributesMatch(requestBody, this.matchArgs);
      }
    }
    return this.paramsMatch(request);
  }

  matches(request) {
    if (this.isDisabled) {
      return false;
    }

    if (!this.extraRequestMatches(request)) {
      return false;
    }

    this.timesCalled++;
    this.logInfo();

    if (this.useOnce) {
      this.disable();
    }

    return true;
  }

  match(matches) {
    this.matchArgs = matches;
    return this;
  }

  // mockId holds the url for this mock request
  oldUrl() {
    return this.mockId && this.mockId.url;
  }

  changedUrl() {
    return this.getUrl() !== this.oldUrl();
  }

  setupHandler() {
    if (!this.mockId) {
      FactoryGuy.requestManager.addHandler(this);
    } else if (this.changedUrl()) {
      FactoryGuy.requestManager.replaceHandler(this);
    }
  }

  // once the mock is used, it will disable itself, so it can't be used again.
  // most useful when using mockCreate to make the same type of model
  // over and over again, and the returning id is different.
  singleUse() {
    this.useOnce = true;
  }

  disable() {
    this.isDisabled = true;
  }

  enable() {
    this.isDisabled = false;
  }

  destroy() {
    FactoryGuy.requestManager.removeHandler(this);
    this.isDestroyed = true;
  }
}
