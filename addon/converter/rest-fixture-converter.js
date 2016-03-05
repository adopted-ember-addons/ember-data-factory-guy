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

  /*
   Find the attributes in the fixture.

   @param {String} modelName
   @param {Object} fixture
   @returns {*}
   */
  extractAttributes(modelName, fixture) {
    let attributes = {};
    let transformKeyFunction = this.getTransformKeyFunction(modelName, 'Attribute');

    this.store.modelFor(modelName).eachAttribute((attribute, meta)=> {
      let attributeKey = transformKeyFunction(attribute);
      let transformValueFunction = this.getTransformValueFunction(meta.type);

      if (fixture.hasOwnProperty(attribute)) {
        attributes[attributeKey] = transformValueFunction(fixture[attribute]);
      } else if (fixture.hasOwnProperty(attributeKey)) {
        attributes[attributeKey] = transformValueFunction(fixture[attributeKey]);
      }
    });
    return attributes;
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

  //extractHasMany(fixture, relationship, relationships) {
  //  let hasManyRecords = fixture[relationship.key];
  //
  //  if (hasManyRecords.isProxy) {
  //    return this.addListProxyData(hasManyRecords, relationship, relationships);
  //  }
  //
  //  if (Ember.typeOf(hasManyRecords) !== 'array') {
  //    return;
  //  }
  //
  //  let relationshipKey = this.transformRelationshipKey(relationship);
  //
  //  let records = hasManyRecords.map((hasManyRecord)=> {
  //    if (Ember.typeOf(hasManyRecord) === 'object') {
  //      if (hasManyRecord.isProxy) {
  //        return this.addProxyData(hasManyRecord, relationship);
  //      }
  //      return this.addData(hasManyRecord, relationship);
  //    } else if (Ember.typeOf(hasManyRecord) === 'instance') {
  //      return this.normalizeAssociation(hasManyRecord, relationship);
  //    }
  //  });
  //
  //  relationships[relationshipKey] = records;
  //}
  //
  //addData(embeddedFixture, relationship) {
  //  let relationshipType = this.getRelationshipType(relationship, embeddedFixture);
  //  // find possibly more embedded fixtures
  //  let data = this.convertSingle(relationshipType, embeddedFixture);
  //  this.addToIncluded(data, relationshipType);
  //  return this.normalizeAssociation(data, relationship);
  //}
  //
  //addProxyData(jsonProxy, relationship) {
  //  let data = jsonProxy.get();
  //  let relationshipType = this.getRelationshipType(relationship, data);
  //  this.addToIncluded(data, relationshipType);
  //  this.addToIncludedFromProxy(jsonProxy);
  //  return this.normalizeAssociation(data, relationship);
  //}
  //
  //addListProxyData(jsonProxy, relationship, relationships) {
  //  let relationshipKey = this.transformRelationshipKey(relationship);
  //  let records = jsonProxy.get().map((data)=> {
  //    let relationshipType = this.getRelationshipType(relationship, data);
  //    this.addToIncluded(data, relationshipType);
  //    return this.normalizeAssociation(data, relationship);
  //  });
  //  this.addToIncludedFromProxy(jsonProxy);
  //  relationships[relationshipKey] = records;
  //}
}

export default RestFixtureConverter;
