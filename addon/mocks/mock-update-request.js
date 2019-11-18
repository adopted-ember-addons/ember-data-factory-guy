import { assert } from '@ember/debug';
import { assign } from '@ember/polyfills';
import FactoryGuy from '../factory-guy';
import MockStoreRequest from './mock-store-request';
import AttributeMatcher from './attribute-matcher';
import MaybeIdUrlMatch from './maybe-id-url-match';

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
   This returns only accepts attrs key

   These attrs are those attributes or relationships that
   you would like returned with the model when the update succeeds.

   You can't user returns if you use mockUpdate with only a modelName like:
   mockUpdate('user'); ( no id specified )

   @param {Object} returns attributes and or relationships to send with payload
   */
  returns(returns) {
    this.validateReturnsOptions(returns);

    assert(`[ember-data-factory-guy] Can't use returns in
      mockUpdate when update only has modelName and no id`, this.id);

    this.returnArgs = returns.attrs;
    this.add = returns.add;
    return this;
  }

  /**
   Adapters freak out if update payload is non empty and there is no id.

   So, if you use mockUpdate like this:
   mockUpdate('user'); ( no id specified ) this mock will return null

   @returns {*}
   */
  getResponse() {
    this.responseJson = null;
    if (Object.keys(this.returnArgs).length) {
      let args = assign({}, this.matchArgs, this.returnArgs),
          json = assign({}, args, {id: this.id});
      this.responseJson = this.fixtureBuilder.convertForBuild(this.modelName, json);
    }
    return super.getResponse();
  }

}
