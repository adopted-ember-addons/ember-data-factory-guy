import Ember from 'ember';
import FactoryGuy from '../factory-guy';
import { isEmptyObject, isEquivalent } from '../utils/helper-functions';

/**
 This is a mixin used by MockUpdate and MockCreateRequest

 Make sure you setup the constructor in the class that uses this mixin
 to set the matchArgs variable

 Example:

 ```
 constructor(modelName, id) {
   super(modelName);
   this.matchArgs = {};
 }
 ```

 @param superclass
 @constructor
 */
const AttributeMatcher = (superclass) => class extends superclass {

  match(matches) {
    this.matchArgs = matches;
    return this;
  }

  /**
   Update and Create mocks can accept 2 return keys 'attrs' and 'add'

   @param options
   @returns {Array}
   */
  validateReturnsOptions(options) {
    const responseKeys     = Object.keys(options),
          validReturnsKeys = ['attrs', 'add'],
          invalidKeys      = responseKeys.filter(key => !validReturnsKeys.includes(key));
    
    Ember.assert(`[ember-data-factory-guy] You passed invalid keys for 'returns' function.
      Valid keys are ${validReturnsKeys}. You used these invalid keys: ${invalidKeys}`,
      invalidKeys.length === 0);

    return responseKeys;
  }

  extraRequestMatches(request) {
    if (this.matchArgs) {
      let requestBody = JSON.parse(request.requestBody);
      if (typeof this.matchArgs === 'function') {
        return this.matchArgs(requestBody);
      } else {
        return this.attributesMatch(requestBody);
      }
    }
    return true;
  }

  /**
   This is tricky, but the main idea here is:

   #1 Take the keys they want to match and transform them to what the serialized
   version would be ie. company => company_id

   #2 Take the matchArgs and turn them into a FactoryGuy payload class by
   FactoryGuy.build(ing) them into a payload

   #3 Wrap the request data into a FactoryGuy payload class

   #4 Go though the keys from #1 and check that both the payloads from #2/#3 have the
   same values

   @param requestData
   @returns {boolean} true is no attributes to match or they all match
   */
  attributesMatch(requestData) {
    let matchArgs = this.matchArgs;
    if (isEmptyObject(matchArgs)) {
      return true;
    }

    let builder = FactoryGuy.fixtureBuilder(this.modelName);

    // transform they match keys
    let matchCheckKeys = Object.keys(matchArgs).map((key) => {
      return builder.transformKey(this.modelName, key);
    });
    // build the match args into a JSONPayload class
    let buildOpts = {serializeMode: true, transformKeys: true};
    let expectedData = builder.convertForBuild(this.modelName, matchArgs, buildOpts);

    // wrap request data in a JSONPayload class
    builder.wrapPayload(this.modelName, requestData);

    // success if all values match
    return matchCheckKeys.every((key) => {
      return isEquivalent(expectedData.get(key), requestData.get(key));
    });
  }
};

export default AttributeMatcher;
