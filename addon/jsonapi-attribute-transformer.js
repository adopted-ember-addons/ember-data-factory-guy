import Ember from 'ember';
import $ from 'jquery';

/**
 * Attribute Transformer for JSONAPISerializer
 * The default transform is to dasherize.
 *
 * @constructor
 */
var JSONAPIAttributeTransformer = function (store) {

  /**
   * Transform attributes in fixture.
   *
   * @param fixture
   * @returns {*} new copy of old fixture with transformed attributes
   */
  this.transform = function (modelName, fixture) {
    var newData, included = [];
    if (Ember.typeOf(fixture.data) === 'array') {
      newData = fixture.data.map(function (single) {
        var copy = $.extend(true, {}, single);
        transformSingle(modelName, copy);
        return copy;
      });
    } else {
      newData = $.extend(true, {}, fixture.data);
      transformSingle(modelName, newData);
    }
    if (fixture.included) {
      included = fixture.included.map(function (single) {
        var copy = $.extend(true, {}, single);
        transformSingle(modelName, copy);
        return copy;
      });
    }
    var newFixture = {data: newData};
    if (!Ember.isEmpty(included)) {
      newFixture.included = included;
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
    if (fixture.attributes) {
      transformObjectKeys(modelName, fixture.attributes);
    }
  };

  var transformObjectKeys = function(modelName, object) {
    var serializer = store.serializerFor(modelName);
    var transformFunction = serializer.keyForAttribute || Ember.String.dasherize;
    for (var key in object) {
      var value = object[key];
      var newKey = transformFunction(key);
      delete object[key];
      object[newKey] = value;
    }
  };

  /**
   Recursively descend into the fixture json, looking for relationships
   whose attributes need transforming
   */
  var findRelationships = function (modelName, fixture) {
    var relationships = fixture.relationships;
    for (var key in relationships) {
      var data = relationships[key].data;
      if (Ember.typeOf(data) === 'array') {
        for (var i = 0, len = data.length; i < len; i++) {
          transformAttributes(modelName, data[i]);
        }
      } else {
        transformAttributes(modelName, data);
      }
    }
    transformRelationshipObjectKeys(modelName, fixture.relationships);
  };

  var transformRelationshipObjectKeys = function(modelName, object) {
    var serializer = store.serializerFor(modelName);
    var transformFunction = serializer.keyForRelationship || Ember.String.dasherize;
    for (var key in object) {
      var value = object[key];
      var newKey = transformFunction(key);
      delete object[key];
      object[newKey] = value;
    }
  };

};

export default JSONAPIAttributeTransformer;
