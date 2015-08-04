import Ember from 'ember';
import $ from 'jquery';

/**
 Attribute Transformer for ActiveModelSerializer
 The default transform is to underscore.

 @param store
 @constructor
 */
var AmsAttributeTransformer = function (store) {

  var defaultTransformFn = ''.underscore;

  /**
   Transform attributes in fixture.

   @param modelName
   @param fixture
   @returns {*} new copy of old fixture with transformed attributes
   */
  this.transform = function (modelName, fixture) {
    var newFixture;
    if (Ember.typeOf(fixture) === 'array') {
      newFixture = fixture.map(function (single) {
        var copy = $.extend(true, {}, single);
        transformSingle(modelName, copy);
        return copy;
      });
    } else {
      newFixture = $.extend(true, {}, fixture);
      transformSingle(modelName, newFixture);
    }
    return newFixture;
  };
  /**
   Transform single record

   @param modelName
   @param fixture
   */
  var transformSingle = function (modelName, fixture) {
    transformAttributes(modelName, fixture);
    findRelationships(modelName, fixture);
  };

  var transformAttributes = function (modelName, fixture) {
    store.modelFor(modelName).eachAttribute(function (attribute) {
      var attributeKey = attribute;
      var value = fixture[attribute];
      if (fixture.hasOwnProperty(attribute)) {
        attributeKey = defaultTransformFn.call(attributeKey);
        delete fixture[attribute];
        fixture[attributeKey] = value;
      }
    });
  };

  /**
   Recursively descend into the fixture json, looking for relationships
   whose attributes need transforming
   */
  var findRelationships = function (modelName, fixture) {
    store.modelFor(modelName).eachRelationship(function (key, relationship) {
      if (relationship.kind === 'belongsTo') {
        var belongsToRecord = fixture[relationship.key];
        if (belongsToRecord) {
          transformSingle(relationship.type, belongsToRecord);
        }
      }
      if (relationship.kind === 'hasMany') {
        var hasManyRecords = fixture[relationship.key];
        if (Ember.typeOf(hasManyRecords) === 'array') {
          hasManyRecords.forEach(function (object) {
            transformSingle(relationship.type, object);
          });
        }
      }
    });
  };
};

export default AmsAttributeTransformer;