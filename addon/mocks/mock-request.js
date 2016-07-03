import Ember from 'ember';
import FactoryGuy from '../factory-guy';
const assign = Ember.assign || Ember.merge;
/* global URI */

export default class {

  constructor(modelName) {
    this.modelName = modelName;
    this.status = 200;
    this.responseHeaders = {};
    this.responseJson = null;
    this.errorResponse = null;
    this.handler = this.setupHandler();
    this.timesCalled = 0;
  }

  getUrl() {
    return FactoryGuy.buildURL(this.modelName);
  }

  getType() {
    return "GET";
  }

  returns(/*options = {}*/) {
  }

  addResponseHeaders(headers) {
    assign(this.responseHeaders, headers);
  }

  succeeds({ status= 200 }={}) {
    this.status = status;
    this.errorResponse = null;
    return this;
  }

  fails({ status= 500, response= null, convertErrors= true }={}) {
    Ember.assert(`[ember-data-factory-guy] 'fails' method status code must be 3XX, 4XX or 5XX,
        you are using: ${status}`, status.toString().match(/^([345]\d{2})/));

    this.status = status;

    if (response) {
      if (convertErrors) {
        let errors = FactoryGuy.fixtureBuilder.convertResponseErrors(response, this.status);
        this.errorResponse = errors;
      } else {
        this.errorResponse = response;
      }
    }
    return this;
  }

  getResponse() {
    return {
      responseText: this.errorResponse || this.responseJson,
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

  // Only check the uri path, not the host name and or query params.
  // The query params will be checked for mockQuery, mockQueryRecord,
  // but for the other mocks ignore them
  basicRequestMatches(settings) {
    const uri = new URI(settings.url);
    const mockUri = new URI(this.getUrl());
    return uri.path() === mockUri.path() && settings.type === this.getType();
  }

  extraRequestMatches(/*settings*/) {
    return true;
  }

  //////////////  common handler for all requests ////////////
  setupHandler() {
    let handler = function(settings) {
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

    Ember.$.mockjax(handler);

    return handler;
  }
}
