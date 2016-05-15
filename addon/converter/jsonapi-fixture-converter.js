import Ember from 'ember';
import Converter from './fixture-converter';
const { dasherize } = Ember.String;

class JSONAPIFixtureConverter extends Converter {

  constructor(store, transformKeys = true) {
    super(store, transformKeys);
    this.defaultKeyTransformFn = dasherize;
    this.polymorphicTypeTransformFn = dasherize;
    this.included = [];
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
   in a json payload ( during deserialization ), convert a record ( model instance )
   into an object with type and id.

   @param {Object} record
   @param {Object} relationship
   */
  normalizeAssociation(record, relationship) {
    if (Ember.typeOf(record) === 'object') {
      if (relationship.options.polymorphic) {
        return { type: dasherize(record.type), id: record.id };
      } else {
        return { type: record.type, id: record.id };
      }
    } else {
      return { type: record.constructor.modelName, id: record.id };
    }
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
      type: modelName,
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
