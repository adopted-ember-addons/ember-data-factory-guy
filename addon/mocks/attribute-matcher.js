import Ember from 'ember';
import FactoryGuy from '../factory-guy';
import {isEquivalent} from '../utils/helper-functions';
const { isEmpty } = Ember;

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

  extraRequestMatches(settings) {
    if (this.matchArgs) {
      let requestData = JSON.parse(settings.data);
      if (typeof this.matchArgs === 'function') {
        return this.matchArgs(requestData);
      } else {
        return this.attributesMatch(requestData);
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
    if (isEmpty(Object.keys(matchArgs))) {
      return true;
    }

    let builder = FactoryGuy.fixtureBuilder(this.modelName);

    // transform they match keys
    let matchCheckKeys = Object.keys(matchArgs).map((key)=> {
      return builder.transformKey(this.modelName, key);
    });

    // build the match args into a JSONPayload class
    let buildOpts = { serializeMode: true, transformKeys: true };
    let expectedData = builder.convertForBuild(this.modelName, matchArgs, buildOpts);

    // wrap request data in a JSONPayload class
    builder.wrapPayload(this.modelName, requestData);

    // success if all values match
    return matchCheckKeys.map((key)=> {
      return isEquivalent(expectedData.get(key), requestData.get(key));
    }).every((value)=> value);
  }
};

export default AttributeMatcher;