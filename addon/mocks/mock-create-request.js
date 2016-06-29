import Ember from 'ember';
import FactoryGuy from '../factory-guy';
import MockRequest from './mock-request';
import {isEquivalent} from '../utils/helper-functions';
const { isPresent, isEmpty } = Ember;

export default class MockCreateRequest extends MockRequest {

  constructor(modelName) {
    super(modelName);
    this.matchArgs = {};
    this.returnArgs = {};
  }

  getType() {
    return "POST";
  }

  match(matches) {
    this.matchArgs = matches;
    return this;
  }

  /**
   * This returns is different than the one for GET requests, because 
   * you don't prefix the returns with json or models etc...
   * The returns arguments are those attributes or relationships that 
   * you would like returned with the model when the create succeeds.
   * 
   * @param {Object} returns attributes and or relationships to return with payload
   */
  returns(returns) {
    this.returnArgs = returns;
    return this;
  }

  /**
   * This is tricky, but the main idea here is:
   *
   * #1 Take the keys they want to match and transform them to what the serialized
   *  version would be ie. company => company_id
   *
   * #2 Take the matchArgs and turn them into a FactoryGuy payload class by
   *  FactoryGuy.build(ing) them into a payload
   *
   * #3 Wrap the request data into a FactoryGuy payload class
   *
   * #4 Go though the keys from #1 and check that both the payloads from #2/#3 have the
   * same values
   *
   * @param requestData
   * @returns {boolean} true is no attributes to match or they all match
   */
  attributesMatch(requestData) {
    if (isEmpty(Object.keys(this.matchArgs))) {
      return true;
    }

    let builder = FactoryGuy.fixtureBuilder;

    // transform they match keys
    let matchCheckKeys = Object.keys(this.matchArgs).map((key)=> {
      return builder.transformKey(this.modelName, key);
    });

    // build the match args into a JSONPayload class
    let buildOpts = { serializeMode: true, transformKeys: true };
    let expectedData = builder.convertForBuild(this.modelName, this.matchArgs, buildOpts);

    // wrap request data in a JSONPayload class
    builder.wrapPayload(this.modelName, requestData);

    // success if all values match
    return matchCheckKeys.map((key)=> {
      return isEquivalent(expectedData.get(key), requestData.get(key));
    }).every((value)=> value);
  }

  /**
   Unless the id is setup already in the return args, then setup a new id. 
   */
  modelId() {
    if (isPresent(this.returnArgs) && isPresent(this.returnArgs['id'])) {
      return this.returnArgs['id'];
    } else {
      let definition = FactoryGuy.findModelDefinition(this.modelName);
      return definition.nextId();
    }
  }

  extraRequestMatches(settings) {
    if (this.matchArgs) {
      let requestData = JSON.parse(settings.data);
      if (!this.attributesMatch(requestData)) {
        return false;
      }
    }
    return true;
  }

  /**
   This mock might be callled a few times in a row so,
   Need to clone the responseJson and add id at the very last minute
   */
  getResponse() {
    let args = Ember.$.extend({}, this.matchArgs, this.returnArgs);
    let json = Ember.$.extend({}, args, { id: this.modelId() });
    this.responseJson = FactoryGuy.fixtureBuilder.convertForBuild(this.modelName, json);
    return super.getResponse();
  }

}
