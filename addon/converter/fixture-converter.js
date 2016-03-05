import Ember from 'ember';

export default class {

  constructor(store, transformKeys = true) {
    this.transformKeys = transformKeys;
    this.store = store;
    this.listType = false;
    this.noTransformFn = (x)=> x;
    this.defaultValueTransformFn = this.noTransformFn;
  }

  transformRelationshipKey(relationship) {
    let transformFn = this.getTransformKeyFunction(relationship.type, 'Relationship');
    return transformFn(relationship.key, relationship.kind);
  }

  getRelationshipType(relationship, fixture) {
    let isPolymorphic = relationship.options.polymorphic;
    return isPolymorphic ? this.polymorphicTypeTransformFn(fixture.type) : relationship.type;
  }

  getTransformKeyFunction(modelName, type) {
    if (!this.transformKeys) { return this.noTransformFn; }
    let serializer = this.store.serializerFor(modelName);
    return serializer['keyFor' + type] || this.defaultKeyTransformFn;
  }

  getTransformValueFunction(type) {
    if (!this.transformKeys) { return this.noTransformFn; }
    if (!type) { return this.defaultValueTransformFn; }
    let container = Ember.getOwner ? Ember.getOwner(this.store) : this.store.container;
    return container.lookup('transform:' + type).serialize;
  }

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
   Extract relationships and descend into those looking for others

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

  /**
   Extract belongTo relationships

   @param fixture
   @param relationship
   @param relationships
   */

  extractBelongsTo(fixture, relationship, relationships) {
    let belongsToRecord = fixture[relationship.key];
    let relationshipKey = this.transformRelationshipKey(relationship);

    let data;
    switch (Ember.typeOf(belongsToRecord)) {

      case 'object':
        if (belongsToRecord.isProxy) {
           data = this.addProxyData(belongsToRecord, relationship);
        } else {
          data = this.addData(belongsToRecord, relationship);
        }
        break;

      case 'instance':
        data = this.normalizeAssociation(belongsToRecord, relationship);
        break;

      case 'number':
      case 'string':
        Ember.assert(
          `Polymorphic relationships cannot be specified by id you
          need to supply an object with id and type`, !relationship.options.polymorphic
        );
        belongsToRecord = { id: belongsToRecord, type: relationship.type };
        data = this.normalizeAssociation(belongsToRecord, relationship);
    }

    relationships[relationshipKey] = this.assignBelongsToRecord(data);
  }

  extractHasMany(fixture, relationship, relationships) {
    let hasManyRecords = fixture[relationship.key];

    if (hasManyRecords.isProxy) {
      return this.addListProxyData(hasManyRecords, relationship, relationships);
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
      } else if (Ember.typeOf(hasManyRecord) === 'number') {
        Ember.assert(
          `Polymorphic relationships cannot be specified by id you
          need to supply an object with id and type`, !relationship.options.polymorphic
        );
        let record = { id: hasManyRecord, type: relationship.type };
        return this.normalizeAssociation(record, relationship);
      }
    });
    relationships[relationshipKey] = this.assignHasManyRecords(records);
  }

  assignBelongsToRecord(record) {
    return record;
  }

  assignHasManyRecords(records) {
    return records;
  }

  addData(embeddedFixture, relationship) {
    let relationshipType = this.getRelationshipType(relationship, embeddedFixture);
    // find possibly more embedded fixtures
    let data = this.convertSingle(relationshipType, embeddedFixture);
    this.addToIncluded(data, relationshipType);
    return this.normalizeAssociation(data, relationship);
  }

  addProxyData(jsonProxy, relationship) {
    let data = jsonProxy.getModelPayload();
    let relationshipType = this.getRelationshipType(relationship, data);
    this.addToIncluded(data, relationshipType);
    this.addToIncludedFromProxy(jsonProxy);
    return this.normalizeAssociation(data, relationship);
  }

  addListProxyData(jsonProxy, relationship, relationships) {
    let relationshipKey = this.transformRelationshipKey(relationship);
    let records = jsonProxy.getModelPayload().map((data)=> {
      let relationshipType = this.getRelationshipType(relationship, data);
      this.addToIncluded(data, relationshipType);
      return this.normalizeAssociation(data, relationship);
    });
    this.addToIncludedFromProxy(jsonProxy);
    relationships[relationshipKey] = this.assignHasManyRecords(records);
  }

}