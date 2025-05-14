import { isPresent } from '@ember/utils';
import { assert } from '@ember/debug';
import FactoryGuy from '../factory-guy';
import MockStoreRequest from './mock-store-request';
import { verifyId } from '../own-config';

export default class MockCreateRequest extends MockStoreRequest {
  constructor(modelName, { model } = {}) {
    super(modelName, 'createRecord');
    this.model = model;
    this.returnArgs = {};
    this.setupHandler();
  }

  getType() {
    return 'POST';
  }

  /**
   This returns only accepts attrs key
   These attrs are those attributes or relationships that
   you would like returned with the model when the create succeeds.

   @param {Object} returns attributes and or relationships to return with payload
   */
  returns(returns) {
    this.validateReturnsOptions(returns);
    this.returnArgs = returns.attrs;
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

  /**
   Unless the id is setup already in the return args, then setup a new id.
   */
  modelId() {
    let returnArgs = this.returnArgs;
    if (isPresent(returnArgs) && isPresent(returnArgs['id'])) {
      return returnArgs['id'];
    } else {
      let definition = FactoryGuy.findModelDefinition(this.modelName);
      return definition.idGenerator.nextId();
    }
  }

  /**
   This mock might be called a few times in a row so,
   Need to clone the responseJson and add id at the very last minute
   */
  getResponse() {
    let args = Object.assign({}, this.matchArgs, this.returnArgs),
      json = Object.assign({}, args, { id: this.modelId() });
    this.responseJson = this.fixtureBuilder.convertForBuild(
      this.modelName,
      json,
    );
    return super.getResponse();
  }
}
