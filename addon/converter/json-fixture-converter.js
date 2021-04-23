import { typeOf } from '@ember/utils';
import { dasherize, underscore } from '@ember/string';
import { isEmptyObject } from '../utils/helper-functions';
import FixtureConverter from './fixture-converter';

/**
 Convert base fixture to a JSON format payload.

 @param store
 @constructor
 */
export default class JSONFixtureConverter extends FixtureConverter {
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
  add(/*moreJson*/) {}

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
  addIncludedArray(/*payload*/) {}

  /**
   Convert single record

   @param {String} modelName
   @param {Object} fixture
   */
  convertSingle(modelName, fixture) {
    let data = {},
      attributes = this.extractAttributes(modelName, fixture),
      relationships = this.extractRelationships(modelName, fixture);

    Object.keys(attributes).forEach((key) => {
      data[key] = attributes[key];
    });
    Object.keys(relationships).forEach((key) => {
      data[key] = relationships[key];
    });

    this.addPrimaryKey(modelName, data, fixture);

    this.verifyLinks(modelName, fixture.links);
    this.assignLinks(data, fixture.links);

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
    if (typeOf(record) === 'object') {
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
   * JSON/REST links can be placed in the data exactly as they appear
   * on the fixture definition
   *
   *   json = build('user', {links: {properties: '/user/1/properties'}});
   *
   *    {
   *      user: {
   *        id: 1,
   *        name: 'User1',
   *        style: "normal",
   *        links: { properties: '/user/1/properties' }
   *      }
   *    }
   *
   * @param data
   * @param links
   */
  assignLinks(data, links) {
    if (!isEmptyObject(links)) {
      data.links = links;
    }
  }

  /**
   The JSONSerializer does not support sideloading records

   @param {String} modelKey
   @param {Object} data
   @param {Object} includeObject
   */
  addToIncluded(/*data, modelKey*/) {}

  /**
   The JSONSerializer does not support sideloading records

   @param proxy json payload proxy
   */
  addToIncludedFromProxy(/*proxy*/) {}
}
