import { assert } from '@ember/debug';
import FactoryGuy from '../factory-guy';
import MockStoreRequest from './mock-store-request';
import { verifyId } from '../own-config';

export default class MockUpdateRequest extends MockStoreRequest {
  constructor(modelName, { id, model } = {}) {
    super(modelName, 'updateRecord');
    this.id = id;
    this.model = model;
    this.returnArgs = {};
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

    assert(
      `[ember-data-factory-guy] Can't use returns in
      mockUpdate when update only has modelName and no id`,
      this.id,
    );

    this.returnArgs = returns.attrs;
    this.add = returns.add;
    return this;
  }

  /**
     Update and Create mocks can accept 2 return keys 'attrs' and 'add'
  
      @param options
      @returns {Array}
      */
  validateReturnsOptions(options) {
    const responseKeys = Object.keys(options),
      validReturnsKeys = ['attrs', 'add'],
      invalidKeys = responseKeys.filter(
        (key) => !validReturnsKeys.includes(key),
      );

    assert(
      `[ember-data-factory-guy] You passed invalid keys for 'returns' function.
          Valid keys are ${validReturnsKeys}. You used these invalid keys: ${invalidKeys}`,
      invalidKeys.length === 0,
    );

    if (options.attrs?.id) verifyId(options.attrs.id);

    return responseKeys;
  }

  getResponse() {
    this.responseJson = undefined;
    if (Object.keys(this.returnArgs).length) {
      let args = Object.assign({}, this.matchArgs, this.returnArgs),
        json = Object.assign({}, args, { id: this.id });
      this.responseJson = this.fixtureBuilder.convertForBuild(
        this.modelName,
        json,
      );
    }
    // handles cases where no id given for mock, eg mockUpdate('user'); - in these cases we can return 204 No Content
    if (!this.responseJson) this.status = 204;
    return super.getResponse();
  }

  /**
   *
   * @returns {String} url
   */
  getUrl() {
    let url = super.getUrl();
    if (!this.id) {
      url = `${url}/:id`;
    }
    return url;
  }
}
