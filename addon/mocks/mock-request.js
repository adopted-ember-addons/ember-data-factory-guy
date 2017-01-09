import Ember from 'ember';
import FactoryGuy from '../factory-guy';
import {stripQueryParams} from '../utils/helper-functions';

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
    this.handler = this.setupHandler();
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

  getUrl() {
    return FactoryGuy.buildURL(this.modelName, this.get('id'), this.requestType);
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
    var convertErrors = opts.hasOwnProperty('convertErrors') ? opts.convertErrors : true;
    var status = opts.status || 500;
    var response = opts.response || null;
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
    return {
      responseText: this.isErrorStatus(this.status) ? this.errorResponse : this.responseJson,
      headers: this.responseHeaders,
      status: this.status
    };
  }

  logInfo() {
    if (FactoryGuy.logLevel > 0) {
      let json = JSON.parse(JSON.stringify(this.responseJson));
      let name = this.constructor.name.replace('Request', '');
      let info = ['[factory-guy]', `${name}(${this.modelName})`, json]
      if (!Ember.$.isEmptyObject(this.queryParams)) {
        info = info.concat(['queryParams:', this.queryParams]);
      }
      console.log(...info);
    }
  }

  paramsMatch() {
    return true;
  }

  typeMatch(settings) {
    return settings.type === this.getType();
  }

  urlMatch(settings) {
    return stripQueryParams(settings.url) === stripQueryParams(this.getUrl());
  }

  // Only check the uri path, not the host name and or query params.
  // The query params will be checked for mockQuery, mockQueryRecord,
  // but for the other mocks ignore them
  basicRequestMatches(settings) {
    return this.typeMatch(settings) && this.urlMatch(settings);
  }

  extraRequestMatches(/*settings*/) {
    return true;
  }

  //////////////  common handler for all requests ////////////
  setupHandler() {
    let handler = function(settings) {
      if (this.isDisabled) {
        return false;
      }
      if (!this.basicRequestMatches(settings)) {
        return false;
      }
      if (!this.extraRequestMatches(settings)) {
        return false;
      }

      this.timesCalled++;
      let response = this.getResponse();
      this.logInfo();
      return response;
    }.bind(this);

    this.mockId = Ember.$.mockjax(handler);

    return handler;
  }

  disable() {
    this.isDisabled = true;
  }

  enable() {
    this.isDisabled = false;
  }

  destroy() {
    Ember.$.mockjax.clear(this.mockId);
    this.isDestroyed = true;
  }
}
