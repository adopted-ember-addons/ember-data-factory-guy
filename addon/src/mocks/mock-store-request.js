/* Disabling the following lint rules as `MockStoreRequest` and `MockGetRequest` contains a `this.get` method */
/* eslint-disable ember/no-get, ember/classic-decorator-no-classic-methods */
import FactoryGuy from '../factory-guy';
import MockRequest from './mock-request';
import { isEmptyObject, isEquivalent } from '../utils/helper-functions';

export default class extends MockRequest {
  constructor(modelName, requestType) {
    super();
    this.modelName = modelName;
    this.requestType = requestType;
    this.fixtureBuilder = FactoryGuy.fixtureBuilder(this.modelName);
  }

  /**
   Used by getUrl to => this.get('id')

   MockGetRequest overrides this since those mocks have a payload with the id

   For mockDelete: If the id is null the url will not include the id, and
   can therefore be used to match any delete for this modelName
   */
  get(...args) {
    if (args[0] === 'id') {
      return this.id;
    }
  }

  /**
   * Using adapterOptions for snapshot in GET requests
   *
   * @returns {String}
   */
  getUrl() {
    return FactoryGuy.buildURL(
      this.modelName,
      this.get('id'),
      this.makeFakeSnapshot(),
      this.requestType,
      this.queryParams,
    );
  }

  /**
   * Create fake snaphot with adapterOptions and record
   *
   * @returns {{adapterOptions: (*|Object), record: (*|DS.Model)}}
   */
  makeFakeSnapshot() {
    let record = this.model;

    if (!record && this.get('id')) {
      record = FactoryGuy.store.peekRecord(this.modelName, this.get('id'));
    }

    return { adapterOptions: this.adapterOptions, record };
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
  attributesMatch(requestData, matchParams) {
    if (isEmptyObject(matchParams)) {
      return true;
    }

    let builder = FactoryGuy.fixtureBuilder(this.modelName);

    // transform they match keys
    let matchCheckKeys = Object.keys(matchParams).map((key) => {
      return builder.transformKey(this.modelName, key);
    });
    // build the match args into a JSONPayload class
    let buildOpts = { serializeMode: true, transformKeys: true };
    let expectedData = builder.convertForBuild(
      this.modelName,
      matchParams,
      buildOpts,
    );

    // wrap request data in a JSONPayload class
    builder.wrapPayload(this.modelName, requestData);

    // success if all values match
    return matchCheckKeys.every((key) => {
      return isEquivalent(expectedData.get(key), requestData.get(key));
    });
  }
}
