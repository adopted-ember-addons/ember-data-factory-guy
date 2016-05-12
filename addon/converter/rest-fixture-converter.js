import Ember from 'ember';
import Converter from './fixture-converter';
const { underscore, pluralize, dasherize } = Ember.String;

/**
 Convert base fixture to a REST format fixture, and while it's converting
 the format, it transforms the attribute and relationship keys as well.

 If there are associations in the base fixture, they will be added to the
 new fixture as 'side loaded' elements, even if they are another json payload
 built whith the build/buildList methods.

 TODO: The weakness here is in polymorphic types, since I am using that type
 attribute to determine the correct model name. There is a work around,
 but waiting to see if anyone complains.

 @param store
 @constructor
 */
class RestFixtureConverter extends Converter {

  constructor(store) {
    super(store);
    this.defaultKeyTransformFn = underscore;
    this.polymorphicTypeTransformFn = underscore;
    this.included = {};
  }

  /**
   Transform attributes in fixture.

   @param modelName
   @param fixture
   @returns {*} converted fixture
   */
  convert(modelName, fixture) {
    let newFixture;

    if (Ember.typeOf(fixture) === 'array') {
      this.listType = true;
      newFixture = fixture.map((single)=> {
        return this.convertSingle(modelName, single);
      });
      modelName = pluralize(modelName);
    } else {
      newFixture = this.convertSingle(modelName, fixture);
    }

    let finalFixture = {};
    finalFixture[modelName] = newFixture;

    Object.keys(this.included).forEach((key)=> {
      finalFixture[key] = this.included[key];
    });

    return finalFixture;
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

    let modelRelationships = this.included[relationshipKey];

    let found = Ember.A(modelRelationships).find((existing)=> {
      return existing.id === data.id;
    });

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
    proxy.includeKeys().forEach((modelKey)=> {
      let includedModels = proxy.getInclude(modelKey);
      includedModels.forEach((data)=> {
        this.addToIncluded(data, modelKey);
      });
    });
  }

}

export default RestFixtureConverter;
