import Ember from 'ember';
import FactoryGuy from '../factory-guy';
import MockRequest from './mock-request';
import AttributeMatcher from './attribute-matcher';
import MaybeIdUrlMatch from './maybe-id-url-match';

export default class MockUpdateRequest extends MaybeIdUrlMatch(AttributeMatcher(MockRequest)) {

  constructor(modelName, id) {
    super(modelName, 'updateRecord');
    this.id = id;
    this.returnArgs = {};
    this.matchArgs = {};
  }

  getType() {
    return FactoryGuy.updateHTTPMethod(this.modelName);
  }

  /**
   This returns only accepts attrs key
   These attrs are those attributes or relationships that
   you would like returned with the model when the update succeeds.

   @param {Object} returns attributes and or relationships to send with payload
   */
  returns(returns) {
    this.validateReturnsOptions(returns);

    if (!this.id) {
      Ember.assert(`[ember-data-factory-guy] Can't use returns in 
      mockUpdate when update only has modelName and no id`, this.id);
    }

    this.returnArgs = returns.attrs;
    return this;
  }

  /**
   Adapters freak out if update payload is non empty response with no id.
   So, if there is no id specified for this update => return null

   @returns {*}
   */
  getResponse() {
    this.responseJson = null;
    if (this.id) {
      let args = Ember.$.extend({}, this.matchArgs, this.returnArgs),
          json = Ember.$.extend({}, args, { id: this.id });
      this.responseJson = this.fixtureBuilder.convertForBuild(this.modelName, json);
    }
    return super.getResponse();
  }

}