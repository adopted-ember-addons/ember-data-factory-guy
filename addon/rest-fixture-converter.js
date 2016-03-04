import Ember from 'ember';

const {
        String: { underscore }
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
    this.defaultKeyTransformFn = Ember.String.underscore;
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
    let included = Ember.A([]);

    let newFixture;
    if (Ember.typeOf(fixture) === 'array') {
      newFixture = fixture.map((single)=> {
        return this.convertSingle(modelName, single, included);
      });
      modelName = modelName.pluralize();
    } else {
      newFixture = this.convertSingle(modelName, fixture, included);
    }

    let finalFixture = {};
    finalFixture[modelName] = newFixture;


    Object.keys(included).forEach((key)=> {
      finalFixture[key] = included[key];
    });

    return finalFixture;
  }

  /**
   Convert single record

   @param {String} modelName
   @param {Object} fixture
   */
  convertSingle(modelName, fixture, included) {
    let data = {};
    let attributes = this.extractAttributes(modelName, fixture);
    let relationships = this.extractRelationships(modelName, fixture, included);
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

   @param {Array} included array of models
   @param {String} modelKey
   @param {Object} data
   */
  addToIncluded(included, modelKey, data) {
    let relationshipKey = Ember.String.pluralize(modelKey.dasherize());

    let typeFound = Object.keys(included).find((includedKey)=> {
      return relationshipKey === includedKey;
    });

    if (!typeFound) {
      included[relationshipKey] = [];
    }

    included[relationshipKey].push(data);

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
   @param {Array} included
   @returns {{}}
   */
  extractRelationships(modelName, fixture, included) {
    let relationships = {};

    this.store.modelFor(modelName).eachRelationship((key, relationship)=> {
      if (fixture.hasOwnProperty(key)) {
        if (relationship.kind === 'belongsTo') {
          this.extractBelongsTo(fixture, relationship, relationships, included);
        } else if (relationship.kind === 'hasMany') {
          this.extractHasMany(fixture, relationship, relationships, included);
        }
      }
    });
    return relationships;
  }

  extractBelongsTo(fixture, relationship, relationships, included) {
    //let isPolymorphic = relationship.options.polymorphic;
    let belongsToRecord = fixture[relationship.key];
    //let normalizedRelationshipKey = this.transformRelationshipKey(relationship);
    let relationshipKey  = this.transformRelationshipKey(relationship);

    if (Ember.typeOf(belongsToRecord) === 'object') {
      let embeddedFixture = belongsToRecord;

      // find possibly more embedded fixtures
      let relationshipType = this.getRelationshipType(relationship, embeddedFixture);
      //let relationshipType = isPolymorphic ? Ember.String.underscore(embeddedFixture.type) : relationship.type;

      //if (embeddedFixture.get) {
      //  embeddedFixture = embeddedFixture.get();
      //}
      relationships[relationshipKey] = this.normalizeAssociation(embeddedFixture, relationship);

      let data = this.convertSingle(relationshipType, embeddedFixture, included);

      this.addToIncluded(included, relationshipType, data);
    } else if (Ember.typeOf(belongsToRecord) === 'instance') {
      relationships[relationshipKey] = this.normalizeAssociation(belongsToRecord, relationship);
    }
  }

  extractHasMany(fixture, relationship, relationships, included) {
    let hasManyRecords = fixture[relationship.key];

    //if (hasManyRecords.get) {
    //  return this.extractHasManyFromBuildList(fixture, relationship, relationships, included);
    //}


    let relationshipKey = this.transformRelationshipKey(relationship);
    //let isPolymorphic = relationship.options.polymorphic;
    //let normalizedRelationshipKey = this.transformRelationshipKey(relationship);
    if (Ember.typeOf(hasManyRecords) === 'array') {

      let records = hasManyRecords.map((hasManyRecord)=> {
        if (Ember.typeOf(hasManyRecord) === 'object') {
          let embeddedFixture = hasManyRecord;

          //if (embeddedFixture.get) {
          //  embeddedFixture = embeddedFixture.get();
          //}

          let relationshipType = this.getRelationshipType(relationship, embeddedFixture);
          //let relationshipType = isPolymorphic ? Ember.String.underscore(embeddedFixture.type) : relationship.type;

          let data = this.convertSingle(relationshipType, embeddedFixture, included);

          this.addToIncluded(included, relationshipType, data);

          return this.normalizeAssociation(data, relationship);
        } else if (Ember.typeOf(hasManyRecord) === 'instance') {
          return this.normalizeAssociation(hasManyRecord, relationship);
        }
      });
      relationships[relationshipKey] = records;
    }
  }

  //extractHasManyFromBuildList(fixture, relationship, relationships, included) {
    //console.log('HERE buildList', fixture);
    //let isPolymorphic = relationship.options.polymorphic;
    //let normalizedRelationshipKey = this.transformRelationshipKey(relationship);
  //}
}

export default RestFixtureConverter;
