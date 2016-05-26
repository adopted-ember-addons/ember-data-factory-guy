import Ember from 'ember';
import FactoryGuy from '../factory-guy';
const assign = Ember.assign || Ember.merge;

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

  succeeds(options) {
    this.status = options && options.status || 200;
    return this;
  }

  fails(options = {}) {
    this.status = options.status || 500;
    if (options.response) {
      let errors = FactoryGuy.fixtureBuilder.convertResponseErrors(options.response);
      this.errorResponse = errors;
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

  paramsMatch() {
    return true;
  }

  basicRequestMatches(settings) {
    return settings.url === this.getUrl() && settings.type === this.getType();
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
      return this.getResponse();
    }.bind(this);

    Ember.$.mockjax(handler);

    return handler;
  }
}