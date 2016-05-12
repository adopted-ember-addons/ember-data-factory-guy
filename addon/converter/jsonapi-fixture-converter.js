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
   Convert an initial fixture into JSONAPI document
   This raw fixture can contain other json in relationships that were
   built by FacoryGuy ( build, buildList ) methods

   @param {String} modelName
   @param {Object} fixture initial raw fixture
   @returns {{data: {type: *, id: *, attributes}: Array}}
   */
  convert(modelName, fixture) {
    let data;

    if (Ember.typeOf(fixture) === 'array') {
      this.listType = true;
      data = fixture.map((single)=> {
        return this.convertSingle(modelName, single);
      });
    } else {
      data = this.convertSingle(modelName, fixture);
    }

    let jsonApiData = { data: data };

    if (!Ember.isEmpty(this.included)) {
      jsonApiData.included = this.included;
    }

    return jsonApiData;
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
