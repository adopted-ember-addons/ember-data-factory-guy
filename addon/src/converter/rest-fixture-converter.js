import { dasherize } from '@ember/string';
import { A } from '@ember/array';
import { pluralize } from 'ember-inflector';
import JSONFixtureConverter from './json-fixture-converter';

/**
 Convert base fixture to a REST Serializer formatted payload.

 @param store
 @constructor
 */
export default class RESTFixtureConverter extends JSONFixtureConverter {
  constructor(store, options) {
    super(store, options);
    this.included = {};
  }

  emptyResponse(modelName, options = {}) {
    return { [modelName]: options.useValue || null };
  }

  /**
   * RESTSerializer has a payload key
   *
   * @param modelName
   * @param fixture
   * @returns {*}
   */
  createPayload(modelName, fixture) {
    return { [this.getPayloadKey(modelName)]: fixture };
  }

  /**
   * Get the payload key for this model from the serializer
   *
   * @param modelName
   * @returns {*}
   */
  getPayloadKey(modelName) {
    let serializer = this.store.serializerFor(modelName),
      payloadKey = modelName;
    // model fragment serializer does not have payloadKeyFromModelName method
    if (serializer.payloadKeyFromModelName) {
      payloadKey = serializer.payloadKeyFromModelName(modelName);
    }
    return this.listType ? pluralize(payloadKey) : payloadKey;
  }

  /**
   * Add the included data to the final payload
   *
   * @param payload
   */
  addIncludedArray(payload) {
    Object.keys(this.included).forEach((key) => {
      if (!payload[key]) {
        payload[key] = this.included[key];
      } else {
        Array.prototype.push.apply(payload[key], this.included[key]);
      }
    });
  }

  /**
   Add the model to included array unless it's already there.

   @param {String} modelKey
   @param {Object} data
   @param {Object} includeObject
   */
  addToIncluded(data, modelKey) {
    let relationshipKey = pluralize(dasherize(modelKey));

    if (!this.included[relationshipKey]) {
      this.included[relationshipKey] = [];
    }

    let modelRelationships = this.included[relationshipKey],
      found = A(modelRelationships).find((existing) => existing.id === data.id);

    if (!found) {
      modelRelationships.push(data);
    }
  }

  /**
   Add proxied json to this payload, by taking all included models and
   adding them to this payloads includes

   @param proxy json payload proxy
   */
  addToIncludedFromProxy(proxy) {
    proxy.includeKeys().forEach((modelKey) => {
      let includedModels = proxy.getInclude(modelKey);
      includedModels.forEach((data) => {
        this.addToIncluded(data, modelKey);
      });
    });
  }
}
