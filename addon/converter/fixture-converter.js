import Ember from 'ember';
/**
 Base class for converting the base fixture that factory guy creates to
 the payload expected by ember data adapter.

 While it's converting the format, it transforms the attribute and relationship keys.
 Don't want to transform keys when building payload for a FactoryGuy#make/makeList operation,
 but only for build/buildList.

 serializerMode (true) means => produce json as if ember data was serializing the payload
 to go back to the server.
 So, what does serializerMode ( false ) mean? produce json that can immediately be consumed
 by ember data .. but it is such a long story .. that I will have to explain another time

 If there are associations in the base fixture, they will be added to the
 new fixture as 'side loaded' elements, even if they are another json payload
 built with the build/buildList methods.
 
 @param {DS.Store} store
 @param {Object} options
 transformKeys transform keys and values in fixture if true
 serializeMode act like serialization is for a return to server if true
 @constructor
 */
export default class {

  constructor(store, options = { transformKeys: true, serializeMode: false }) {
    this.transformKeys = options.transformKeys;
    this.serializeMode = options.serializeMode;
    this.store = store;
    this.listType = false;
    this.noTransformFn = (x)=> x;
    this.defaultValueTransformFn = this.noTransformFn;
  }

  /**
   Convert an initial fixture into a final payload.
   This raw fixture can contain other json in relationships that were
   built by FactoryGuy ( build, buildList ) methods

   @param modelName
   @param fixture
   @returns {*} converted fixture
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

    let payload = this.createPayload(modelName, data);

    this.addIncludedArray(payload);

    return payload;
  }

  /**
   Empty response is a special case, so use this method for generating it.

   @param _
   @param {Object} options useValue to override the null value that is passed
   @returns {Array|null}
   */
  emptyResponse(_, options = {}) {
    return options.useValue || null;
  }

  /**
   * Use the primaryKey from the serializer if it is declared
   *
   * @param modelName
   * @param data
   * @param fixture
   */
  addPrimaryKey(modelName, data, fixture) {
    let primaryKey = this.store.serializerFor(modelName).get('primaryKey');
    let primaryKeyValue = fixture[primaryKey] || fixture.id;
    // model fragments will have no primaryKey and don't want them to have id
    if (primaryKeyValue) {
      // need to set the id for all as a baseline
      data.id = primaryKeyValue;
      // if the id is NOT the primary key, need to make sure that the primaryKey
      // has the primaryKey value
      data[primaryKey] = primaryKeyValue;
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

  attributeIncluded(attribute, modelName) {
    if (!this.serializeMode) {
      return true;
    }
    let serializer = this.store.serializerFor(modelName);
    let attrOptions = this.attrsOption(serializer, attribute);
    if (attrOptions && attrOptions.serialize === false) {
      return false;
    }
    return true;
  }

  getTransformKeyFunction(modelName, type) {
    if (!this.transformKeys) {
      return this.noTransformFn;
    }

    let serializer = this.store.serializerFor(modelName);
    let keyFn = serializer['keyFor' + type] || this.defaultKeyTransformFn;

    return ((attribute, method)=> {
      // if there is an attrs override in serializer, return that first
      let attrOptions = this.attrsOption(serializer, attribute);
      let attrName;
      if (attrOptions) {
        if (attrOptions.key) {
          attrName = attrOptions.key;
        }
        if (Ember.typeOf(attrOptions) === "string") {
          attrName = attrOptions;
        }
      }
      return attrName || keyFn.apply(this, [attribute, method]);
    });
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
      if (this.attributeIncluded(attribute, modelName)) {
        let attributeKey = transformKeyFunction(attribute);
        let transformValueFunction = this.getTransformValueFunction(meta.type);

        if (fixture.hasOwnProperty(attribute)) {
          attributes[attributeKey] = transformValueFunction(fixture[attribute]);
        } else if (fixture.hasOwnProperty(attributeKey)) {
          attributes[attributeKey] = transformValueFunction(fixture[attributeKey]);
        }
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

    let isEmbedded = this.isEmbeddedRelationship(parentModelName, relationship.key);

    let data = this.extractSingleRecord(belongsToRecord, relationship, isEmbedded);

    let relationshipKey = isEmbedded ? relationship.key : this.transformRelationshipKey(relationship);

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
    let option = attrs && (attrs[Ember.String.camelize(attr)] || attrs[attr]);
    return option;
    //    return (option && option.key) ? option.key : option;
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
