import { isEmpty, typeOf } from '@ember/utils';
import { dasherize } from '@ember/string';
import { A } from '@ember/array';
import FixtureConverter from './fixture-converter';
import { entries } from '../utils/helper-functions';

/**
 * Using `serializeMode` to create a payload the way ember-data would serialize types
 * when returning a payload to a server that accepts JSON-API wherin the types are
 * pluralized
 *
 */
export default class JSONAPIFixtureConverter extends FixtureConverter {
  constructor(store, { transformKeys = true, serializeMode = false } = {}) {
    super(store, { transformKeys, serializeMode });
    this.typeTransformFn = this.serializeMode
      ? this.typeTransformViaSerializer
      : dasherize;
    this.defaultKeyTransformFn = dasherize;
    this.polymorphicTypeTransformFn = dasherize;
    this.included = [];
  }

  typeTransformViaSerializer(modelName) {
    let serializer = this.store.serializerFor(modelName);
    return serializer.payloadKeyFromModelName(modelName);
  }

  emptyResponse(_, options = {}) {
    return { data: options.useValue || null };
  }

  /**
   * JSONAPISerializer does not use modelName for payload key,
   * and just has 'data' as the top level key.
   *
   * @param modelName
   * @param fixture
   * @returns {*}
   */
  createPayload(modelName, fixture) {
    return { data: fixture };
  }

  /**
   * Add the included data
   *
   * @param payload
   */
  addIncludedArray(payload) {
    if (!isEmpty(this.included)) {
      payload.included = this.included;
    }
  }

  /**
   In order to conform to the way ember data expects to handle relationships
   in a json api payload ( during deserialization ), convert a record ( model instance )
   into an object with type and id. Types are pluralized.

   @param {Object or DS.Model instance} record
   @param {Object} relationship
   */
  normalizeAssociation(record) {
    if (typeOf(record) === 'object') {
      return { type: this.typeTransformFn(record.type), id: record.id };
    } else {
      return {
        type: this.typeTransformFn(record.constructor.modelName),
        id: record.id,
      };
    }
  }

  isEmbeddedRelationship(/*modelName, attr*/) {
    return false;
  }

  /**
   Recursively descend into the fixture json, looking for relationships that are
   either record instances or other fixture objects that need to be normalized
   and/or included in the 'included' hash

   @param modelName
   @param fixture
   @param included
   @returns {{type: *, id: *, attributes}}
   */
  convertSingle(modelName, fixture) {
    let polymorphicType = fixture.type;
    if (polymorphicType && fixture._notPolymorphic) {
      polymorphicType = modelName;
      delete fixture._notPolymorphic;
    }
    let data = {
      type: this.typeTransformFn(polymorphicType || modelName),
      attributes: this.extractAttributes(modelName, fixture),
    };

    this.addPrimaryKey(modelName, data, fixture);

    let relationships = this.extractRelationships(modelName, fixture);

    this.verifyLinks(modelName, fixture.links);
    this.assignLinks(relationships, fixture.links);

    if (Object.getOwnPropertyNames(relationships).length > 0) {
      data.relationships = relationships;
    }

    return data;
  }

  /*
   Add the model to included array unless it's already there.
   */
  addToIncluded(data) {
    let found = A(this.included).find((model) => {
      return model.id === data.id && model.type === data.type;
    });
    if (!found) {
      this.included.push(data);
    }
  }

  addToIncludedFromProxy(proxy) {
    proxy.includes().forEach((data) => {
      this.addToIncluded(data);
    });
  }

  assignRelationship(object) {
    return { data: object };
  }

  /**
   * JSONAPI can have data and links in the same relationship definition
   * so do special handling to make it happen
   *
   *  json = build('user', {links: {company: '/user/1/company'}});
   *
   *  {
   *    data: {
   *      id: 1,
   *      type: 'user',
   *      attributes: {
   *        name: 'User1',
   *        style: "normal"
   *      },
   *      relationships: {
   *        company: {
   *          links: {related: '/user/1/company'}
   *        }
   *      }
   *    }
   *
   * @param relationshipData
   * @param links
   */
  assignLinks(relationshipData, links) {
    for (let [relationshipKey, link] of entries(links || {})) {
      let data = relationshipData[relationshipKey];
      data = Object.assign({ links: { related: link } }, data);
      relationshipData[relationshipKey] = data;
    }
  }
}
