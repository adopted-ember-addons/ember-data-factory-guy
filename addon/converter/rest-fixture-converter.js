import Ember from 'ember';
import Converter from './fixture-converter';
const { String: { underscore, pluralize } } = Ember;

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
      finalFixture[key] = Array.from(this.included[key]);
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
    data.id = fixture.id;
    return data;
  }

  /**
   Add the model to included array unless it's already there.

   @param {String} modelKey
   @param {Object} data
   */
  addToIncluded(data, modelKey) {
    let relationshipKey = pluralize(modelKey.dasherize());

    let typeFound = Object.keys(this.included).find((includedKey)=> {
      return relationshipKey === includedKey;
    });

    if (!typeFound) {
      this.included[relationshipKey] = new Set();
    }

    this.included[relationshipKey].add(data);
  }

  addToIncludedFromProxy(proxy) {
    proxy.includeKeys().forEach((modelKey)=> {
      let includedModels = proxy.getInclude(modelKey);
      includedModels.forEach((data)=> {
        this.addToIncluded(data, modelKey);
      });
    });
  }

  transformRelationshipKey(relationship) {
    let transformFn = this.getTransformKeyFunction(relationship.type, 'Relationship');
    let transformedKey = transformFn(relationship.key, relationship.kind);
    if (relationship.options.polymorphic) {
      transformedKey = transformedKey.replace('_id', '');
    }
    return transformedKey;
  }

  //getTransformValueFunction(type) {
  //  let container = Ember.getOwner ? Ember.getOwner(this.store) : this.store.container;
  //  return type ? container.lookup('transform:' + type).serialize : this.defaultValueTransformFn;
  //}

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
}

export default RestFixtureConverter;
