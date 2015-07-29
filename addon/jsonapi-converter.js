import Ember from 'ember';

var JSONAPIConverter = function (store) {

  /**
   Convert an initial fixture into JSONAPI document

   @param modelName
   @param fixture
   @returns {{data: {type: *, id: *, attributes}, included: Array}}
   */
  this.convert = function (modelName, fixture) {
    //console.log('JSONAPIConverter#convert', modelName, fixture)
    var included = [];
    var data;

    if (Ember.typeOf(fixture) === 'array') {
      data = fixture.map(function (single) {
        return convertSingle(modelName, single, included);
      });
    } else {
      data = convertSingle(modelName, fixture, included);
    }
    var jsonApiData = {data: data};
    if (!Ember.isEmpty(included)) {
      jsonApiData.included = included;
    }
    //console.log('jsonApiData', jsonApiData)
    return jsonApiData;
  };

  /**
   In order to conform to the way ember data expects to handle relationships
   in a json payload ( during deserialization ), convert a record ( model instance )
   into an object with type and id, or convert object same way.

   @param record
   @param relationship
   */
  var normalizeJSONAPIAssociation = function (record, relationship) {
    if (Ember.typeOf(record) === 'object') {
      if (relationship.options.polymorphic) {
        return {type: Ember.String.dasherize(record.type), id: record.id};
      } else {
        return {type: record.type, id: record.id};
      }
    } else {
      return {type: record.constructor.modelName, id: record.id};
    }
  };
  /**
   Recursively descend into the fixture json, looking for relationships that are
   either record instances or other fixture objects that need to be normalized
   and/or included in the 'included' hash

   @param modelName
   @param fixture
   @param included
   @returns {{type: *, id: *, attributes}}
   */
  var convertSingle = function (modelName, fixture, included) {
    var data = {
      type: modelName,
      id: fixture.id,
      attributes: extractAttributes(modelName, fixture),
    };
    var relationships = extractRelationships(modelName, fixture, included);
    if (Object.getOwnPropertyNames(relationships).length > 0) {
      data.relationships = relationships;
    }
    return data;
  };
  /*
   Find the attributes in the fixture.

   @param modelName
   @param fixture
   @returns {{}}
   */
  var extractAttributes = function (modelName, fixture) {
    var attributes = {};
    store.modelFor(modelName).eachAttribute(function (attribute) {
      var attributeKey = attribute;
      if (fixture.hasOwnProperty(attribute)) {
        attributes[attributeKey] = fixture[attribute];
      }
    });
    return attributes;
  };
  /*
   Add the model to included array unless it's already there.
   */
  var addToIncluded = function (included, data) {
    included = Ember.A(included);
    var found = included.find(function (model) {
      return model.id === data.id && model.type === data.type;
    });
    if (!found) {
      included.push(data);
    }
  };
  /**

   @param modelName
   @param fixture
   @param included
   @returns {{}}
   */
  var extractRelationships = function (modelName, fixture, included) {
    var relationships = {};

    store.modelFor(modelName).eachRelationship(function (key, relationship) {
      var isPolymorphic = relationship.options.polymorphic;
      if (fixture.hasOwnProperty(key)) {
        if (relationship.kind === 'belongsTo') {
          var belongsToRecord = fixture[relationship.key];
          if (Ember.typeOf(belongsToRecord) === 'object') {
            var embeddedFixture = belongsToRecord;
            // find possibly more embedded fixtures
            var relationshipType = isPolymorphic ? Ember.String.dasherize(embeddedFixture.type) : relationship.type;
            var data = convertSingle(relationshipType, embeddedFixture, included);
            addToIncluded(included, data);
            relationships[relationship.key] = {data: normalizeJSONAPIAssociation(data, relationship)};
          } else if (Ember.typeOf(belongsToRecord) === 'instance') {
            relationships[relationship.key] = {data: normalizeJSONAPIAssociation(belongsToRecord, relationship)};
          }
        } else if (relationship.kind === 'hasMany') {
          var hasManyRecords = fixture[relationship.key];
          if (Ember.typeOf(hasManyRecords) === 'array') {
            var records = hasManyRecords.map(function (hasManyRecord) {
              if (Ember.typeOf(hasManyRecord) === 'object') {
                var embeddedFixture = hasManyRecord;
                var relationshipType = isPolymorphic ? Ember.String.dasherize(embeddedFixture.type) : relationship.type;
                var data = convertSingle(relationshipType, embeddedFixture, included);
                addToIncluded(included, data);
                return normalizeJSONAPIAssociation(data, relationship);
              } else if (Ember.typeOf(hasManyRecord) === 'instance') {
                return normalizeJSONAPIAssociation(hasManyRecord, relationship);
              }
            });
            relationships[relationship.key] = {data: records};
          }
        }
      }
    });
    return relationships;
  };

};

export default JSONAPIConverter;