import Ember from 'ember';
import $ from 'jquery';

var AmsAttributeTransformer = function (store) {
  var defaultTransformFn = ''.underscore;

  this.transform = function (modelName, fixture) {
    var newFixture;
    if (Ember.typeOf(fixture) === 'array') {
      newFixture = fixture.map(function(single) {
        var copy = $.extend(true, {}, single);
        transformSingle(modelName, copy);
        return copy;
      });
    } else {
      newFixture = $.extend(true, {}, fixture);
      transformSingle(modelName, newFixture);
    }
    //console.log(newFixture)
    return newFixture;
  };

  /**
   Recursively descend into the fixture json, looking for attributes that are
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
        //console.log(mode, attributeKey, value);
        delete fixture[attribute];
        fixture[attributeKey] = value;
      }
    });
  };


  var findRelationships = function (modelName, fixture) {
    store.modelFor(modelName).eachRelationship(function (key, relationship) {
      if (relationship.kind === 'belongsTo') {
        var belongsToRecord = fixture[relationship.key];
        //console.log(key, relationship.type, relationship.key, fixture[relationship.key])
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