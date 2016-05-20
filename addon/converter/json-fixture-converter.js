import Ember from 'ember';
import Converter from './fixture-converter';
const { underscore } = Ember.String;

/**
 Convert base fixture to a JSON format payload.

 @param store
 @constructor
 */
export default class extends Converter {

  constructor(store) {
    super(store);
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
//    if (this.listType) {
//      return { results: fixture, next: 2, previous: 1, total_pages: 2 };
//    }
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
    let data = {};
    let attributes = this.extractAttributes(modelName, fixture);
    let relationships = this.extractRelationships(modelName, fixture);

    Object.keys(attributes).forEach((key)=> {
      data[key] = attributes[key];
    });
    Object.keys(relationships).forEach((key)=> {
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
    if (Ember.typeOf(record) === 'object') {
      if (relationship.options.polymorphic) {
        return { type: underscore(record.type), id: record.id };
      } else {
        return record.id;
      }
    } else {
      return record.id;
    }
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