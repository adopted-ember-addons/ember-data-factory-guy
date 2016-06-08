import Ember from 'ember';
import Converter from './fixture-converter';
const { pluralize, dasherize } = Ember.String;

/**
 * Using `serializeMode` to create a payload the way ember-data would serialize types
 * when returning a payload to a server that accepts JSON-API wherin the types are 
 * pluralized
 * 
 */
class JSONAPIFixtureConverter extends Converter {

  constructor(store, options = { transformKeys: true, serializeMode: false }) {
    super(store, options);
    this.typeTransformFn = this.serializeMode ? pluralize : this.noTransformFn;
    this.defaultKeyTransformFn = dasherize;
    this.polymorphicTypeTransformFn = dasherize;
    this.included = [];
  }

  emptyResponse(_, options={}) {
    return {data: options.useValue || null};
  }

  /**
   * JSONAPIerializer does not use modelName for payload key,
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
    if (!Ember.isEmpty(this.included)) {
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
  normalizeAssociation(record, relationship) {
    if (Ember.typeOf(record) === 'object') {
      if (relationship.options.polymorphic) {
        return { type: this.typeTransformFn(dasherize(record.type)), id: record.id };
      } else {
        return { type: this.typeTransformFn(record.type), id: record.id };
      }
    } else {
      return { type: this.typeTransformFn(record.constructor.modelName), id: record.id };
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
    let data = {
      type: this.typeTransformFn(modelName),
      attributes: this.extractAttributes(modelName, fixture),
    };

    this.addPrimaryKey(modelName, data, fixture);

    let relationships = this.extractRelationships(modelName, fixture);
    if (Object.getOwnPropertyNames(relationships).length > 0) {
      data.relationships = relationships;
    }
    return data;
  }

  /*
   Add the model to included array unless it's already there.
   */
  addToIncluded(data) {
    let found = Ember.A(this.included).find((model)=> {
      return model.id === data.id && model.type === data.type;
    });
    if (!found) {
      this.included.push(data);
    }
  }

  addToIncludedFromProxy(proxy) {
    proxy.includes().forEach((data)=> {
      this.addToIncluded(data);
    });
  }

  assignRelationship(object) {
    return { data: object };
  }

}

export default JSONAPIFixtureConverter;
