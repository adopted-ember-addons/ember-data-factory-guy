import Ember from 'ember';

const {
        String: { underscore, pluralize }
        } = Ember;

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
class RestFixtureConverter {

  constructor(store) {
    this.store = store;
    this.defaultKeyTransformFn = underscore;
    this.included = [];
    this.listType = false;
    this.defaultValueTransformFn = function(x) {
      return x;
    };
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
  addToIncluded(modelKey, data) {
    let relationshipKey = pluralize(modelKey.dasherize());

    let typeFound = Object.keys(this.included).find((includedKey)=> {
      return relationshipKey === includedKey;
    });

    if (!typeFound) {
      this.included[relationshipKey] = [];
    }

    this.included[relationshipKey].push(data);

  }

  addToIncludedFromProxy(proxy) {
    //console.log('addToIncludedFromProxy',proxy, proxy.includeKeys());
    proxy.includeKeys().forEach((modelKey)=> {
      this.addToIncluded(modelKey, proxy.getInclude(modelKey));
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

  getTransformKeyFunction(modelName, type) {
    let serializer = this.store.serializerFor(modelName);
    return serializer['keyFor' + type] || this.defaultKeyTransformFn;
  }

  getTransformValueFunction(type) {
    let container = Ember.getOwner ? Ember.getOwner(this.store) : this.store.container;
    return type ? container.lookup('transform:' + type).serialize : this.defaultValueTransformFn;
  }

  getRelationshipType(relationship, fixture) {
    let isPolymorphic = relationship.options.polymorphic;
    //console.log("getRelationshipType", relationship, fixture, "isPolymorphic:", isPolymorphic);
    return isPolymorphic ? underscore(fixture.type) : relationship.type;
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
   Descend into relationships looking for records to transform to jsonapi standard, or
   record instances to convert to json

   @param {String} modelName
   @param {Object} fixture
   @returns {{}}
   */
  extractRelationships(modelName, fixture) {
    let relationships = {};

    this.store.modelFor(modelName).eachRelationship((key, relationship)=> {
      if (fixture.hasOwnProperty(key)) {
        if (relationship.kind === 'belongsTo') {
          this.extractBelongsTo(fixture, relationship, relationships);
        } else if (relationship.kind === 'hasMany') {
          this.extractHasMany(fixture, relationship, relationships);
        }
      }
    });
    return relationships;
  }

  extractBelongsTo(fixture, relationship, relationships) {
    let belongsToRecord = fixture[relationship.key];

    let relationshipKey = this.transformRelationshipKey(relationship);

    if (Ember.typeOf(belongsToRecord) === 'object') {
      if (belongsToRecord.isProxy) {
        relationships[relationshipKey] = this.addProxyData(belongsToRecord, relationship);
      } else {
        relationships[relationshipKey] = this.addData(belongsToRecord, relationship);
      }
    } else if (Ember.typeOf(belongsToRecord) === 'instance') {
      relationships[relationshipKey] = this.normalizeAssociation(belongsToRecord, relationship);
    }
  }

  extractHasMany(fixture, relationship, relationships) {
    let hasManyRecords = fixture[relationship.key];

    if (hasManyRecords.isProxy) {
      return this.extractHasManyFromBuildList(hasManyRecords, relationship, relationships);
    }

    if (Ember.typeOf(hasManyRecords) !== 'array') {
      return;
    }

    let relationshipKey = this.transformRelationshipKey(relationship);

    let records = hasManyRecords.map((hasManyRecord)=> {
      if (Ember.typeOf(hasManyRecord) === 'object') {
        if (hasManyRecord.isProxy) {
          return this.addProxyData(hasManyRecord, relationship);
        }
        return this.addData(hasManyRecord, relationship);
      } else if (Ember.typeOf(hasManyRecord) === 'instance') {
        return this.normalizeAssociation(hasManyRecord, relationship);
      }
    });

    relationships[relationshipKey] = records;
  }

  addData(embeddedFixture, relationship) {
    let relationshipType = this.getRelationshipType(relationship, embeddedFixture);
    let data = this.convertSingle(relationshipType, embeddedFixture);
    this.addToIncluded(relationshipType, data);
    return this.normalizeAssociation(data, relationship);
  }

  addProxyData(jsonProxy, relationship) {
    let data = jsonProxy.get();
    let relationshipType = this.getRelationshipType(relationship, data);
    this.addToIncluded(relationshipType, data);
    this.addToIncludedFromProxy(jsonProxy);
    return this.normalizeAssociation(data, relationship);
  }

  extractHasManyFromBuildList(hasManyRecords, relationship, relationships) {
    let relationshipKey = this.transformRelationshipKey(relationship);
    let records = hasManyRecords.get().map((embeddedFixture)=> {
      return this.addData(embeddedFixture, relationship);
    });
    relationships[relationshipKey] = records;
  }
}

export default RestFixtureConverter;
