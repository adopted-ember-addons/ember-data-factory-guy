import Ember from 'ember';
import FactoryGuy from '../factory-guy';
import MockStoreRequest from './mock-store-request';
import AttributeMatcher from './attribute-matcher';
import MaybeIdUrlMatch from './maybe-id-url-match';
import { assign } from '@ember/polyfills';

export default class MockUpdateRequest extends MaybeIdUrlMatch(AttributeMatcher(MockStoreRequest)) {

  constructor(modelName, {id, model} = {}) {
    super(modelName, 'updateRecord');
    this.id = id;
    this.model = model;
    this.returnArgs = {};
    this.matchArgs = {};
    this.setupHandler();
  }

  getType() {
    return FactoryGuy.updateHTTPMethod(this.modelName);
  }

  /**
   * Create fake snaphot with adapterOptions and record.
   *
   * Override the parent to find the model in the store if there is
   * an id available
   *
   * @returns {{adapterOptions: (*|Object), record: (*|DS.Model)}}
   */
  makeFakeSnapshot() {
    let snapshot = super.makeFakeSnapshot();
    if (this.id && !this.model) {
      snapshot.record = FactoryGuy.store.peekRecord(this.modelName, this.id);
    }
    return snapshot;
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
    this.add = returns.add;
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
      let args = assign({}, this.matchArgs, this.returnArgs),
          json = assign({}, args, {id: this.id});
      this.responseJson = this.fixtureBuilder.convertForBuild(this.modelName, json);
    }
    return super.getResponse();
  }

}
