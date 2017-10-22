import Ember from 'ember';
import FactoryGuy from '../factory-guy';
import {isEmptyObject} from '../utils/helper-functions';
import RequestManager from './request-manager';

const assign = Ember.assign || Ember.merge;

export default class {

  constructor(modelName, requestType) {
    this.modelName = modelName;
    this.requestType = requestType;
    this.fixtureBuilder = FactoryGuy.fixtureBuilder(this.modelName);
    this.status = 200;
    this.responseHeaders = {};
    this.responseJson = null;
    this.errorResponse = null;
    this.isDisabled = false;
    this.isDestroyed = false;
    //    this.handler = this.setupHandler();
    this.timesCalled = 0;
  }

  /**
   Used by getUrl to => this.get('id')

   MockGetRequest overrides this since those mocks have a payload with the id

   For mockDelete: If the id is null the url will not include the id, and
   can therefore be used to match any delete for this modelName
   */
  get(...args) {
    if (args[0] === 'id') {
      return this.id;
    }
  }

  /**
   * Using adapterOptions for snapshot in GET requests
   * @returns {String}
   */
  getUrl() {
    return FactoryGuy.buildURL(
      this.modelName,
      this.get('id'),
      { adapterOptions: this._adapterOptions },
      this.requestType,
      this.queryParams
    );
  }

  getType() {
    return "GET";
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

  getResponse() {
    let responseText = this.isErrorStatus(this.status) ? this.errorResponse : this.responseJson;
    return {
      responseText: JSON.stringify(responseText),
      headers: this.responseHeaders,
      status: this.status
    };
  }

  logInfo() {
    if (FactoryGuy.logLevel > 0) {
      let json = JSON.parse(JSON.stringify(this.responseJson)),
          name = this.constructor.name.replace('Request', ''),
          info = ['[factory-guy]', `${name}(${this.modelName})`, json];
      if (!isEmptyObject(this.queryParams)) {
        info = info.concat(['queryParams:', this.queryParams]);
      }
      console.log(...info);
    }
  }

  paramsMatch() {
    return true;
  }

  //  typeMatch(settings) {
  //    return settings.type === this.getType();
  //  }

  //  urlMatch(settings) {
  //    return stripQueryParams(settings.url) === stripQueryParams(this.getUrl());
  //  }

  // Only check the uri path, not the host name and or query params.
  // The query params will be checked for mockQuery, mockQueryRecord,
  // but for the other mocks ignore them
  //  basicRequestMatches(settings) {
  //    return this.typeMatch(settings) && this.urlMatch(settings);
  //  }

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

  //////////////  common handler for all requests ////////////
  //  setupHandler() {
  //    let handler = function(request) {
  //      if (this.isDisabled) {
  //        return false;
  //      }
  //      //      if (!this.basicRequestMatches(settings)) {
  //      //        return false;
  //      //      }
  //      if (!this.extraRequestMatches(request)) {
  //        return false;
  //      }
  //
  //      this.timesCalled++;
  //      let response = this.getResponse();
  //      this.logInfo();
  //      if (this.useOnce) {
  //        this.disable();
  //      }
  //      return response;
  //    }.bind(this);
  //
  //    this.mockId = Ember.$.mockjax(handler);
  //    return handler;
  //  }
  oldUrl() {
    return this.mockId && this.mockId.url
  }

  changedUrl() {
    return this.getUrl() !== this.oldUrl();
  }

  setupHandler() {
    //    console.log('setupHandler',this.id);
    if (!this.mockId) {
      RequestManager.addHandler(this);
    } else if (this.changedUrl()) {
      RequestManager.replaceHandler(this);
    }
//    console.log('setupHandler', 'url', this.getType(), this.getUrl(), 'id:', this.mockId,  'model id:',this.get('id'));
  }

  // once the mock is used, it will disable itself, so it can't be used again.
  // most usefull when using mockCreate to make the same type of model
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
//    Ember.$.mockjax.clear(this.mockId);
    this.isDestroyed = true;
  }
}
