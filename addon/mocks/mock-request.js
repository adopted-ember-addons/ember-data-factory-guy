import Ember from 'ember';
import { isEmptyObject } from '../utils/helper-functions';
import FactoryGuy from '../factory-guy';
import RequestManager from './request-manager';
import { assign } from '@ember/polyfills';

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

  //  with(options={}) {
  //  }

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
  get() {
  }

  /**
   * @returns {String}
   */
  getUrl() {
  }

  getType() {
    return 'GET';
  }

  returns(/*options = {}*/) {
  }

  addResponseHeaders(headers) {
    assign(this.responseHeaders, headers);
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
    let convertErrors = opts.hasOwnProperty('convertErrors') ? opts.convertErrors : true,
        status        = opts.status || 500,
        response      = opts.response || null;
    Ember.assert(`[ember-data-factory-guy] 'fails' method status code must be 3XX, 4XX or 5XX,
        you are using: ${status}`, this.isErrorStatus(status));

    this.status = status;
    this.errorResponse = response;

    if (response && convertErrors) {
      let errors = this.fixtureBuilder.convertResponseErrors(response, this.status);
      this.errorResponse = errors;
    }

    return this;
  }

  // for a fails response, the response you might have set ( like a payload ) will
  // be discarded in favour of the error response that was built for you in fails method
  actualResponseJson() {
    let responseText = this.isErrorStatus(this.status) ? this.errorResponse : this.responseJson;
    return JSON.stringify(responseText);
  }

  getResponse() {
    return {
      responseText: this.actualResponseJson(),
      headers: this.responseHeaders,
      status: this.status
    };
  }

  logInfo() {
    if (FactoryGuy.logLevel > 0) {
      const json   = JSON.parse(this.getResponse().responseText),
            name   = this.constructor.name.replace('Request', ''),
            type   = this.getType(),
            status = `[${this.status}]`,
            url    = this.getUrl();

      let fullUrl = url;
      if (!isEmptyObject(this.queryParams)) {
        fullUrl = [url, '?', Ember.$.param(this.queryParams)].join('');
      }

      const info = ['[factory-guy]', name, type, status, fullUrl, json];

      console.log(...info);
    }
  }

  paramsMatch() {
    return true;
  }

  extraRequestMatches(/*request*/) {
    return true;
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

  // mockId holds the url for this mock request
  oldUrl() {
    return this.mockId && this.mockId.url
  }

  changedUrl() {
    return this.getUrl() !== this.oldUrl();
  }

  setupHandler() {
    if (!this.mockId) {
      RequestManager.addHandler(this);
    } else if (this.changedUrl()) {
      RequestManager.replaceHandler(this);
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
    RequestManager.removeHandler(this);
    this.isDestroyed = true;
  }
}
