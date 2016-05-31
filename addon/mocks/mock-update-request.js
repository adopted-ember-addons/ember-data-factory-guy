import Ember from 'ember';
import FactoryGuy from '../factory-guy';
import MockRequest from './mock-request';

export default class extends MockRequest {

  constructor(modelName, id) {
    super(modelName);
    this.id = id;
    this.returnArgs = {};
  }

  getUrl() {
    return FactoryGuy.buildURL(this.modelName, this.id);
  }

  getType() {
    return FactoryGuy.updateHTTPMethod();
  }

  /**
   * This returns is different than the one for GET requests, because
   * you don't prefix the returns with json or models etc...
   * The returns arguments are those attributes or relationships that
   * you would like returned with the model when the update succeeds.
   *
   * @param {Object} returns attributes and or relationships to send with payload
   */
  returns(returns) {
    this.returnArgs = returns;
    return this;
  }

  fails(options = {}) {
    super.fails(options);
    if (options.response) {
      this.errorResponse = options.response;
    }
    return this;
  }

  getResponse() {
    let json = Ember.$.extend({}, this.returnArgs, { id: this.id });
    this.responseJson = FactoryGuy.fixtureBuilder.convertForBuild(this.modelName, json);
    return super.getResponse();
  }

}