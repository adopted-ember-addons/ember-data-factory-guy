import Ember from 'ember';
import FactoryGuy from '../factory-guy';
import MockRequest from './mock-request';
import AttributeMatcher from './attribute-matcher';
const { isPresent } = Ember;

export default class MockCreateRequest extends AttributeMatcher(MockRequest) {

  constructor(modelName) {
    super(modelName, 'createRecord');
    this.returnArgs = {};
    this.matchArgs = {};
  }

  getType() {
    return "POST";
  }

  /**
   This returns is different than the one for GET requests, because
   you don't prefix the returns with json or models etc...
   The returns arguments are those attributes or relationships that
   you would like returned with the model when the create succeeds.

   @param {Object} returns attributes and or relationships to return with payload
   */
  returns(returns) {
    this.returnArgs = returns;
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
    let args = Ember.$.extend({}, this.matchArgs, this.returnArgs);
    let json = Ember.$.extend({}, args, { id: this.modelId() });
    this.responseJson = this.fixtureBuilder.convertForBuild(this.modelName, json);
    return super.getResponse();
  }

}
