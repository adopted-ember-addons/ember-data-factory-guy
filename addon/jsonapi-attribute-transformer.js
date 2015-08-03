import Ember from 'ember';
import $ from 'jquery';

/**
 * Attribute Transformer for JSONAPISerializer
 * The default transform is to dasherize.
 *
 * @constructor
 */
var JSONAPIAttributeTransformer = function (/*store*/) {
  var defaultTransformFn = ''.dasherize;

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
        transformSingle(copy);
        return copy;
      });
    } else {
      newData = $.extend(true, {}, fixture.data);
      transformSingle(newData);
    }
    if (fixture.included) {
      included = fixture.included.map(function (single) {
        var copy = $.extend(true, {}, single);
        transformSingle(copy);
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
  var transformSingle = function (fixture) {
    transformAttributes(fixture);
    findRelationships(fixture);
  };

  var transformAttributes = function (fixture) {
    if (fixture.attributes) {
      transormObjectKeys(fixture.attributes);
    }
  };

  var transormObjectKeys = function(object) {
    for (var key in object) {
      var value = object[key];
      var newKey = defaultTransformFn.call(key);
      delete object[key];
      object[newKey] = value;
    }
  };

  /**
   Recursively descend into the fixture json, looking for relationships
   whose attributes need transforming
   */
  var findRelationships = function (fixture) {
    var relationships = fixture.relationships;
    for (var key in relationships) {
      var data = relationships[key].data;
      if (Ember.typeOf(data) === 'array') {
        for (var i = 0, len = data.length; i < len; i++) {
          transformAttributes(data[i]);
        }
      } else {
        transformAttributes(data);
      }
    }
    transormObjectKeys(fixture.relationships);
  };
};

export default JSONAPIAttributeTransformer;