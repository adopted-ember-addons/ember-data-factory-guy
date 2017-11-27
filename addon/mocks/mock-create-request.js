import Ember from 'ember';
import FactoryGuy from '../factory-guy';
import MockStoreRequest from './mock-store-request';
import AttributeMatcher from './attribute-matcher';

import { assign } from '@ember/polyfills';
const {isPresent} = Ember;

export default class MockCreateRequest extends AttributeMatcher(MockStoreRequest) {

  constructor(modelName, {model} = {}) {
    super(modelName, 'createRecord');
    this.model = model;
    this.returnArgs = {};
    this.matchArgs = {};
    this.setupHandler();
  }

  getType() {
    return "POST";
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
   Unless the id is setup already in the return args, then setup a new id.
   */
  modelId() {
    let returnArgs = this.returnArgs;
    if (isPresent(returnArgs) && isPresent(returnArgs['id'])) {
      return returnArgs['id'];
    } else {
      let definition = FactoryGuy.findModelDefinition(this.modelName);
      return definition.nextId();
    }
  }

  /**
   This mock might be called a few times in a row so,
   Need to clone the responseJson and add id at the very last minute
   */
  getResponse() {
    let args = assign({}, this.matchArgs, this.returnArgs),
        json = assign({}, args, {id: this.modelId()});
    this.responseJson = this.fixtureBuilder.convertForBuild(this.modelName, json);
    return super.getResponse();
  }

}
