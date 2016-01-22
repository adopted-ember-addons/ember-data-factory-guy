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
var RestFixtureConverter = function (store) {
  var self = this;
  var defaultKeyTransformFn = Ember.String.underscore;
  var defaultValueTransformFn = function(x) { return x; };
  /**
   Transform attributes in fixture.

   @param modelName
   @param fixture
   @returns {*} converted fixture
   */
  this.convert = function (modelName, fixture) {
    var included = Ember.A([]);

    var newFixture;
    if (Ember.typeOf(fixture) === 'array') {
      newFixture = fixture.map(function (single) {
        return convertSingle(modelName, single, included);
      });
      modelName = modelName.pluralize();
    } else {
      newFixture = convertSingle(modelName, fixture, included);
    }

    var finalFixture = {};
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
  var convertSingle = function (modelName, fixture, included) {
    var data = {};
    var attributes = extractAttributes(modelName, fixture);
    var relationships = extractRelationships(modelName, fixture, included);
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
  var extractAttributes = function (modelName, fixture) {
    var attributes = {};
    var transformKeyFunction = getTransformKeyFunction(modelName, 'Attribute');

    store.modelFor(modelName).eachAttribute(function (attribute, meta) {
      var attributeKey = transformKeyFunction(attribute);
      var transformValueFunction = getTransformValueFunction(meta.type);

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
  var addToIncluded = function (included, modelKey, data) {
    var relationshipKey = Ember.String.pluralize(modelKey.dasherize());

    var typeFound = Object.keys(included).find(function(includedKey) {
      return relationshipKey === includedKey;
    });

    if (!typeFound) {
      included[relationshipKey] = [];
    }

    included[relationshipKey].push(data);

  };


  this.transformRelationshipKey = function (relationship) {
    var transformFn = getTransformKeyFunction(relationship.type, 'Relationship');
    var transformedKey = transformFn(relationship.key, relationship.kind);
    if (relationship.options.polymorphic) {
      transformedKey = transformedKey.replace('_id', '');
    }
    return transformedKey;
  };

  var getTransformKeyFunction = function(modelName, type) {
    var serializer = store.serializerFor(modelName);
    return serializer['keyFor'+type] || defaultKeyTransformFn;
  };

  var getTransformValueFunction = function (type) {
    return type ? store.container.lookup('transform:' + type).serialize : defaultValueTransformFn;
  };

  /**

   @param {Object} record
   @param {Object} relationship
   */
  var normalizeRESTAssociation = function (record, relationship) {
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
  var extractRelationships = function (modelName, fixture, included) {
    var relationships = {},
        normalizedRelationshipKey;

    store.modelFor(modelName).eachRelationship(function (key, relationship) {
      var isPolymorphic = relationship.options.polymorphic;
      if (fixture.hasOwnProperty(key)) {
        if (relationship.kind === 'belongsTo') {
          var belongsToRecord = fixture[relationship.key];
          normalizedRelationshipKey = self.transformRelationshipKey(relationship);
          if (Ember.typeOf(belongsToRecord) === 'object') {
            var embeddedFixture = belongsToRecord;

            // find possibly more embedded fixtures
            var relationshipType = isPolymorphic ? Ember.String.underscore(embeddedFixture.type) : relationship.type;
            relationships[normalizedRelationshipKey] = normalizeRESTAssociation(embeddedFixture, relationship);

            var data = convertSingle(relationshipType, embeddedFixture, included);

            addToIncluded(included, relationshipType, data);
          } else if (Ember.typeOf(belongsToRecord) === 'instance') {
            relationships[normalizedRelationshipKey] = normalizeRESTAssociation(belongsToRecord, relationship);
          }
        } else if (relationship.kind === 'hasMany') {
          var hasManyRecords = fixture[relationship.key];
          normalizedRelationshipKey = self.transformRelationshipKey(relationship);
          if (Ember.typeOf(hasManyRecords) === 'array') {
            var records = hasManyRecords.map(function (hasManyRecord) {
              if (Ember.typeOf(hasManyRecord) === 'object') {
                var embeddedFixture = hasManyRecord;

                var relationshipType = isPolymorphic ? Ember.String.underscore(embeddedFixture.type) : relationship.type;

                var data = convertSingle(relationshipType, embeddedFixture, included);

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
