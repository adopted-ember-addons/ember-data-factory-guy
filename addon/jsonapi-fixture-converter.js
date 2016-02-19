import Ember from 'ember';

let JSONAPIFixtureConverter = function (store) {

  /**
   Convert an initial fixture into JSONAPI document

   NOTE: The main reason I need this custom class and can't use the built in
   ember-data normalize functions to create the JSONAPI doc is that
   FactoryGuy allows for creating related models with other model instances.
   The raw fixture that FactoryGuy creates will therefore be incompatible with
   that normalize function since it disallows instances in the json.

   TODO: Might want to transform keys at the same time as RESTConverter does

   @param {String} modelName
   @param {Object} fixture initial raw fixture
   @returns {{data: {type: *, id: *, attributes}, included: Array}}
   */
  this.convert = function (modelName, fixture) {
    let included = [];
    let data;

    if (Ember.typeOf(fixture) === 'array') {
      data = fixture.map(function (single) {
        return convertSingle(modelName, single, included);
      });
    } else {
      data = convertSingle(modelName, fixture, included);
    }
    let jsonApiData = {data: data};
    if (!Ember.isEmpty(included)) {
      jsonApiData.included = included;
    }
    return jsonApiData;
  };
  /**
   In order to conform to the way ember data expects to handle relationships
   in a json payload ( during deserialization ), convert a record ( model instance )
   into an object with type and id.

   @param {Object} record
   @param {Object} relationship
   */
  let normalizeJSONAPIAssociation = function (record, relationship) {
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
  let convertSingle = function (modelName, fixture, included) {
    let data = {
      type: modelName,
      id: fixture.id,
      attributes: extractAttributes(modelName, fixture),
    };
    let relationships = extractRelationships(modelName, fixture, included);
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
  let extractAttributes = function (modelName, fixture) {
    let attributes = {};
    store.modelFor(modelName).eachAttribute(function (attribute) {
      let attributeKey = attribute;
      if (fixture.hasOwnProperty(attribute)) {
        attributes[attributeKey] = fixture[attribute];
      }
    });
    return attributes;
  };
  /*
   Add the model to included array unless it's already there.
   */
  let addToIncluded = function (included, data) {
    let found = Ember.A(included).find(function (model) {
      return model.id === data.id && model.type === data.type;
    });
    if (!found) {
      included.push(data);
    }
  };
  /**
   Descend into relationships looking for records to transform to jsonapi standard, or
   record instances to convert to json

   @param modelName
   @param fixture
   @param included
   @returns {{}}
   */
  let extractRelationships = function (modelName, fixture, included) {
    let relationships = {};

    store.modelFor(modelName).eachRelationship(function (key, relationship) {
      let isPolymorphic = relationship.options.polymorphic;
      if (fixture.hasOwnProperty(key)) {
        if (relationship.kind === 'belongsTo') {
          let belongsToRecord = fixture[relationship.key];
          if (Ember.typeOf(belongsToRecord) === 'object') {
            let embeddedFixture = belongsToRecord;
            // find possibly more embedded fixtures
            let relationshipType = isPolymorphic ? Ember.String.dasherize(embeddedFixture.type) : relationship.type;
            let data = convertSingle(relationshipType, embeddedFixture, included);
            addToIncluded(included, data);
            relationships[relationship.key] = {data: normalizeJSONAPIAssociation(data, relationship)};
          } else if (Ember.typeOf(belongsToRecord) === 'instance') {
            relationships[relationship.key] = {data: normalizeJSONAPIAssociation(belongsToRecord, relationship)};
          } else if (typeof belongsToRecord === 'string' || typeof belongsToRecord === 'number') {
            Ember.assert('Polymorphic relationships cannot be specified by ID', !isPolymorphic);
            relationships[relationship.key] = {data: normalizeJSONAPIAssociation({id: belongsToRecord, type: relationship.type}, relationship)};
          }
        } else if (relationship.kind === 'hasMany') {
          let hasManyRecords = fixture[relationship.key];
          if (Ember.typeOf(hasManyRecords) === 'array') {
            let records = hasManyRecords.map(function (hasManyRecord) {
              if (Ember.typeOf(hasManyRecord) === 'object') {
                let embeddedFixture = hasManyRecord;
                let relationshipType = isPolymorphic ? Ember.String.dasherize(embeddedFixture.type) : relationship.type;
                let data = convertSingle(relationshipType, embeddedFixture, included);
                addToIncluded(included, data);
                return normalizeJSONAPIAssociation(data, relationship);
              } else if (Ember.typeOf(hasManyRecord) === 'instance') {
                return normalizeJSONAPIAssociation(hasManyRecord, relationship);
              } else if (typeof hasManyRecord === 'string' || typeof hasManyRecord === 'number') {
                Ember.assert('Polymorphic relationships cannot be specified by ID', !isPolymorphic);
                return normalizeJSONAPIAssociation({id: hasManyRecord, type: relationship.type}, relationship);
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

export default JSONAPIFixtureConverter;
