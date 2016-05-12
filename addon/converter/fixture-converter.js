import Ember from 'ember';

export default class {

  constructor(store, transformKeys = true) {
    this.transformKeys = transformKeys;
    this.store = store;
    this.listType = false;
    this.noTransformFn = (x)=> x;
    this.defaultValueTransformFn = this.noTransformFn;
  }

  addPrimaryKey(modelName, data, fixture) {
    let primaryKey = this.store.serializerFor(modelName).get('primaryKey');
    data.id = fixture.id;
    if(primaryKey !== 'id') {
      data[primaryKey] = fixture.id;
    }
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
    if (!this.transformKeys) {
      return this.noTransformFn;
    }
    let serializer = this.store.serializerFor(modelName);
    return serializer['keyFor' + type] || this.defaultKeyTransformFn;
  }

  getTransformValueFunction(type) {
    if (!this.transformKeys || (type && type.match('-mf'))) {
      return this.noTransformFn;
    }
    if (!type) {
      return this.defaultValueTransformFn;
    }
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
          this.extractBelongsTo(fixture, relationship, modelName, relationships);
        } else if (relationship.kind === 'hasMany') {
          this.extractHasMany(fixture, relationship, modelName, relationships);
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
  extractBelongsTo(fixture, relationship, parentModelName, relationships) {
    let belongsToRecord = fixture[relationship.key];

    let relationshipKey = this.transformRelationshipKey(relationship);
    let isEmbedded = this.isEmbeddedRelationship(parentModelName, relationshipKey);

    let data = this.extractSingleRecord(belongsToRecord, relationship, isEmbedded);

    relationships[relationshipKey] = this.assignRelationship(data);
  }

  // Borrowed from ember data
  // checks config for attrs option to embedded (always)
  isEmbeddedRelationship(modelName, attr) {
    let serializer = this.store.serializerFor(modelName);
    var option = this.attrsOption(serializer, attr);
    return option && (option.embedded === 'always' || option.deserialize === 'records');
  }

  attrsOption(serializer, attr) {
    var attrs = serializer.get('attrs');
    return attrs && (attrs[Ember.String.camelize(attr)] || attrs[attr]);
  }

  extractHasMany(fixture, relationship, parentModelName, relationships) {
    let hasManyRecords = fixture[relationship.key];

    let relationshipKey = this.transformRelationshipKey(relationship);
    let isEmbedded = this.isEmbeddedRelationship(parentModelName, relationshipKey);

    if (hasManyRecords.isProxy) {
      return this.addListProxyData(hasManyRecords, relationship, relationships, isEmbedded);
    }

    if (Ember.typeOf(hasManyRecords) !== 'array') {
      return;
    }

    let records = hasManyRecords.map((hasManyRecord)=> {
      return this.extractSingleRecord(hasManyRecord, relationship, isEmbedded);
    });

    relationships[relationshipKey] = this.assignRelationship(records);
  }

  extractSingleRecord(record, relationship, isEmbedded) {
    let data;
    switch (Ember.typeOf(record)) {

      case 'object':
        if (record.isProxy) {
          data = this.addProxyData(record, relationship, isEmbedded);
        } else {
          data = this.addData(record, relationship, isEmbedded);
        }
        break;

      case 'instance':
        data = this.normalizeAssociation(record, relationship);
        break;

      case 'number':
      case 'string':
        Ember.assert(
          `Polymorphic relationships cannot be specified by id you
          need to supply an object with id and type`, !relationship.options.polymorphic
        );
        record = { id: record, type: relationship.type };
        data = this.normalizeAssociation(record, relationship);
    }

    return data;
  }

  assignRelationship(object) {
    return object;
  }

  addData(embeddedFixture, relationship, isEmbedded) {
    let relationshipType = this.getRelationshipType(relationship, embeddedFixture);
    // find possibly more embedded fixtures
    let data = this.convertSingle(relationshipType, embeddedFixture);
    if (isEmbedded) {
      return data;
    }
    this.addToIncluded(data, relationshipType);
    return this.normalizeAssociation(data, relationship);
  }

  // proxy data is data that was build with FactoryGuy.build method
  addProxyData(jsonProxy, relationship, isEmbedded) {
    let data = jsonProxy.getModelPayload();
    let relationshipType = this.getRelationshipType(relationship, data);
    if (isEmbedded) {
      this.addToIncludedFromProxy(jsonProxy);
      return data;
    }
    this.addToIncluded(data, relationshipType);
    this.addToIncludedFromProxy(jsonProxy);
    return this.normalizeAssociation(data, relationship);
  }

  // listProxy data is data that was build with FactoryGuy.buildList method
  addListProxyData(jsonProxy, relationship, relationships, isEmbedded) {
    let relationshipKey = this.transformRelationshipKey(relationship);

    let records = jsonProxy.getModelPayload().map((data)=> {
      if (isEmbedded) {
        return data;
      }
      let relationshipType = this.getRelationshipType(relationship, data);
      this.addToIncluded(data, relationshipType);
      return this.normalizeAssociation(data, relationship);
    });

    this.addToIncludedFromProxy(jsonProxy);

    relationships[relationshipKey] = this.assignRelationship(records);
  }

}
