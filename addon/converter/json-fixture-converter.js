import Ember from 'ember';
import Converter from './fixture-converter';

const { underscore, dasherize } = Ember.String;

/**
 Convert base fixture to a JSON format payload.

 @param store
 @constructor
 */
export default class extends Converter {

  constructor(store, options) {
    super(store, options);
    this.defaultKeyTransformFn = underscore;
    this.polymorphicTypeTransformFn = underscore;
  }

  /**
   * Can't add to payload since sideloading not supported
   *
   * @param moreJson
   */
  add(/*moreJson*/) {
  }

  /**
   * There is no payload key for JSON Serializer
   *
   * @param modelName
   * @param fixture
   * @returns {*}
   */
  createPayload(_, fixture) {
    return fixture;
  }

  /**
   * There is no sideloading for JSON Serializer
   *
   * @param payload
   */
  addIncludedArray(/*payload*/) {
  }

  /**
   Convert single record

   @param {String} modelName
   @param {Object} fixture
   */
  convertSingle(modelName, fixture) {
    let data          = {},
        attributes    = this.extractAttributes(modelName, fixture),
        relationships = this.extractRelationships(modelName, fixture);

    Object.keys(attributes).forEach((key) => {
      data[key] = attributes[key];
    });
    Object.keys(relationships).forEach((key) => {
      data[key] = relationships[key];
    });

    this.addPrimaryKey(modelName, data, fixture);

    return data;
  }

  transformRelationshipKey(relationship) {
    let transformedKey = super.transformRelationshipKey(relationship);
    if (relationship.options.polymorphic) {
      transformedKey = transformedKey.replace('_id', '');
    }
    return transformedKey;
  }

  /**

   @param {Object} record
   @param {Object} relationship
   */
  normalizeAssociation(record, relationship) {
    if (this.serializeMode) {
      return record.id;
    }
    if (Ember.typeOf(record) === 'object') {
      if (relationship.options.polymorphic) {
        return { type: dasherize(record.type), id: record.id };
      } else {
        return record.id;
      }
    }
    // it's a model instance
    if (relationship.options.polymorphic) {
      return { type: dasherize(record.constructor.modelName), id: record.id };
    }
    return record.id;
  }

  /**
   The JSONSerializer does not support sideloading records

   @param {String} modelKey
   @param {Object} data
   @param {Object} includeObject
   */
  addToIncluded(/*data, modelKey*/) {
  }

  /**
   The JSONSerializer does not support sideloading records

   @param proxy json payload proxy
   */
  addToIncludedFromProxy(/*proxy*/) {
  }

}