import { assert } from '@ember/debug';
import { isEmptyObject, param } from '../utils/helper-functions';
import FactoryGuy from '../factory-guy';
import isMatch from 'lodash.ismatch';
import isEqual from 'lodash.isEqual';

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
    return new Response(this.actualResponseJson(), {
      status: this.status,
      headers: this.responseHeaders,
    });
  }

  async logInfo() {
    if (FactoryGuy.logLevel > 0) {
      const json = JSON.parse(await this.getResponse().clone().text()),
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

  // eslint-disable-next-line no-unused-vars
  paramsMatch({ request, params }) {
    const requestUrl = new URL(request.url, window.location.origin);
    if (!isEmptyObject(this.someQueryParams)) {
      // request must have every specified item in someQueryParams, but can have more.
      const someQueryParams = new URLSearchParams(param(this.someQueryParams)); // convert json -> URLSearchParams
      return someQueryParams
        .keys()
        .every((key) =>
          isEqual(
            someQueryParams.getAll(key),
            requestUrl.searchParams.getAll(key),
          ),
        );
    }
    if (!isEmptyObject(this.queryParams)) {
      // request must have exactly specified queryParams, no more no less.
      const queryParams = new URLSearchParams(param(this.queryParams));
      return (
        queryParams
          .keys()
          .every((key) =>
            isEqual(
              queryParams.getAll(key),
              requestUrl.searchParams.getAll(key),
            ),
          ) &&
        requestUrl.searchParams
          .keys()
          .every((key) =>
            isEqual(
              queryParams.getAll(key),
              requestUrl.searchParams.getAll(key),
            ),
          )
      );
    }
    return true;
  }

  attributesMatch(requestBody, matchParams) {
    return isMatch(requestBody, matchParams);
  }

  async extraRequestMatches({ request, params }) {
    if (this.matchArgs) {
      // Try to figure out request body type without relying on request headers
      let requestBody;
      try {
        requestBody = await request.clone().text();
      } catch (e) {
        // continue
      }
      try {
        requestBody = await request.clone().json();
      } catch (e) {
        // continue
      }
      try {
        requestBody = await request.formData();
      } catch (e) {
        // continue
      }
      if (typeof this.matchArgs === 'function') {
        return this.matchArgs(requestBody);
      } else {
        return this.attributesMatch(requestBody, this.matchArgs);
      }
    }
    return await this.paramsMatch({ request, params });
  }

  async matches({ request, params }) {
    if (this.isDisabled) {
      return false;
    }

    const isMatch = await this.extraRequestMatches({ request, params });
    if (!isMatch) {
      return false;
    }

    this.timesCalled++;
    await this.logInfo();

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
