import Ember from 'ember';

/**
 Convert base fixture to a REST format fixture, and while it's converting
 the format, it transforms the attribute and relationship keys as well.

 If there are associations in the base fixture, they will be added to the
 new fixture as 'side loaded' elements

 TODO: The weakness here is in polymorphic types, since I am using that type
   attribute to determine the correct model name. There is a work around,
   but waiting to see if anyone complains.

 @param store
 @constructor
 */
let RestFixtureConverter = function (store) {
  let self = this;
  let defaultKeyTransformFn = Ember.String.underscore;
  let defaultValueTransformFn = function(x) { return x; };
  /**
   Transform attributes in fixture.

   @param modelName
   @param fixture
   @returns {*} converted fixture
   */
  this.convert = function (modelName, fixture) {
    let included = Ember.A([]);

    let newFixture;
    if (Ember.typeOf(fixture) === 'array') {
      newFixture = fixture.map(function (single) {
        return convertSingle(modelName, single, included);
      });
      modelName = modelName.pluralize();
    } else {
      newFixture = convertSingle(modelName, fixture, included);
    }

    let finalFixture = {};
    finalFixture[modelName] = newFixture;


    Object.keys(included).forEach(function(key) {
      finalFixture[key] = included[key];
    });

    return finalFixture;
  };
  /**
   Convert single record

   @param {String} modelName
   @param {Object} fixture
   */
  let convertSingle = function (modelName, fixture, included) {
    let data = {};
    let attributes = extractAttributes(modelName, fixture);
    let relationships = extractRelationships(modelName, fixture, included);
    Object.keys(attributes).forEach(function(key) {
      data[key] = attributes[key];
    });
    Object.keys(relationships).forEach(function(key) {
      data[key] = relationships[key];
    });
    data.id = fixture.id;
    return data;
  };
  /*
   Find the attributes in the fixture.

   @param {String} modelName
   @param {Object} fixture
   @returns {*}
   */
  let extractAttributes = function (modelName, fixture) {
    let attributes = {};
    let transformKeyFunction = getTransformKeyFunction(modelName, 'Attribute');

    store.modelFor(modelName).eachAttribute(function (attribute, meta) {
      let attributeKey = transformKeyFunction(attribute);
      let transformValueFunction = getTransformValueFunction(meta.type);

      if (fixture.hasOwnProperty(attribute)) {
        attributes[attributeKey] = transformValueFunction(fixture[attribute]);
      } else if (fixture.hasOwnProperty(attributeKey)) {
        attributes[attributeKey] = transformValueFunction(fixture[attributeKey]);
      }
    });
    return attributes;
  };


  /**
    Add the model to included array unless it's already there.

    @param {Array} included array of models
    @param {String} modelKey
    @param {Object} data
   */
  let addToIncluded = function (included, modelKey, data) {
    let relationshipKey = Ember.String.pluralize(modelKey.dasherize());

    let typeFound = Object.keys(included).find(function(includedKey) {
      return relationshipKey === includedKey;
    });

    if (!typeFound) {
      included[relationshipKey] = [];
    }

    included[relationshipKey].push(data);

  };


  this.transformRelationshipKey = function (relationship) {
    let transformFn = getTransformKeyFunction(relationship.type, 'Relationship');
    let transformedKey = transformFn(relationship.key, relationship.kind);
    if (relationship.options.polymorphic) {
      transformedKey = transformedKey.replace('_id', '');
    }
    return transformedKey;
  };

  var getTransformKeyFunction = function(modelName, type) {
    let serializer = store.serializerFor(modelName);
    return serializer['keyFor'+type] || defaultKeyTransformFn;
  };

  let getTransformValueFunction = function (type) {
    let container = Ember.getOwner ? Ember.getOwner(store) : store.container;
    return type ? container.lookup('transform:' + type).serialize : defaultValueTransformFn;
  };

  /**

   @param {Object} record
   @param {Object} relationship
   */
  let normalizeRESTAssociation = function (record, relationship) {
    if (Ember.typeOf(record) === 'object') {
      if (relationship.options.polymorphic) {
        return {type: Ember.String.underscore(record.type), id: record.id};
      } else {
        return record.id;
      }
    } else {
      return record.id;
    }
  };

  /**
   Descend into relationships looking for records to transform to jsonapi standard, or
   record instances to convert to json

   @param {String} modelName
   @param {Object} fixture
   @param {Array} included
   @returns {{}}
   */
  let extractRelationships = function (modelName, fixture, included) {
    let relationships = {},
        normalizedRelationshipKey;

    store.modelFor(modelName).eachRelationship(function (key, relationship) {
      let isPolymorphic = relationship.options.polymorphic;
      if (fixture.hasOwnProperty(key)) {
        if (relationship.kind === 'belongsTo') {
          let belongsToRecord = fixture[relationship.key];
          normalizedRelationshipKey = self.transformRelationshipKey(relationship);
          if (Ember.typeOf(belongsToRecord) === 'object') {
            let embeddedFixture = belongsToRecord;

            // find possibly more embedded fixtures
            let relationshipType = isPolymorphic ? Ember.String.underscore(embeddedFixture.type) : relationship.type;
            relationships[normalizedRelationshipKey] = normalizeRESTAssociation(embeddedFixture, relationship);

            let data = convertSingle(relationshipType, embeddedFixture, included);

            addToIncluded(included, relationshipType, data);
          } else if (Ember.typeOf(belongsToRecord) === 'instance') {
            relationships[normalizedRelationshipKey] = normalizeRESTAssociation(belongsToRecord, relationship);
          }
        } else if (relationship.kind === 'hasMany') {
          let hasManyRecords = fixture[relationship.key];
          normalizedRelationshipKey = self.transformRelationshipKey(relationship);
          if (Ember.typeOf(hasManyRecords) === 'array') {
            let records = hasManyRecords.map(function (hasManyRecord) {
              if (Ember.typeOf(hasManyRecord) === 'object') {
                let embeddedFixture = hasManyRecord;

                let relationshipType = isPolymorphic ? Ember.String.underscore(embeddedFixture.type) : relationship.type;

                let data = convertSingle(relationshipType, embeddedFixture, included);

                addToIncluded(included, relationshipType, data);

                return normalizeRESTAssociation(data, relationship);
              } else if (Ember.typeOf(hasManyRecord) === 'instance') {
                return normalizeRESTAssociation(hasManyRecord, relationship);
              }
            });
            relationships[normalizedRelationshipKey] = records;
          }
        }
      }
    });
    return relationships;
  };

};

export default RestFixtureConverter;
