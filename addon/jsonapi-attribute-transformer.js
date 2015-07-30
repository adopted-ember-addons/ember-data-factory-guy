import Ember from 'ember';
import $ from 'jquery';

/**
 * Attribute Transformer for JSONAPISerializer
 * The default transform is to dasherize.
 *
 * @constructor
 */
var JSONAPIAttributeTransformer = function () {
  var defaultTransformFn = ''.dasherize;

  /**
   * Transform attributes in fixture.
   *
   * @param fixture
   * @returns {*} new copy of old fixture with transformed attributes
   */
  this.transform = function (fixture) {
    var newFixture;
    if (Ember.typeOf(fixture.data) === 'array') {
      newFixture = fixture.data.map(function (single) {
        var copy = $.extend(true, {}, single);
        transformSingle(copy);
        return copy;
      });
    } else {
      newFixture = $.extend(true, {}, fixture.data);
      transformSingle(newFixture);
    }
    return {data: newFixture};
  };
  /**
   Transform single record

   @param modelName
   @param fixture
   */
  var transformSingle = function (fixture) {
    transformAttributes(fixture);
    findRelationships(fixture);
    if (fixture.included) {
      fixture.included.forEach(function (included) {
        transformAttributes(included);
      });
    }
  };

  var transformAttributes = function (fixture) {
    var attributes = fixture.attributes;
    for (var attribute in attributes) {
      var attributeKey = attribute;
      var value = attributes[attribute];
      attributeKey = defaultTransformFn.call(attributeKey);
      delete attributes[attribute];
      attributes[attributeKey] = value;
    }
  };

  /**
   Recursively descend into the fixture json, looking for relationships
   whose attributes need transforming
   */
  var findRelationships = function (fixture) {
    var relationships = fixture.relationships;
    for (var relationship in relationships) {
      var data = relationship.data;
      if (Ember.typeOf(data) === 'array') {
        for (var i = 0, len = data.length; i < len; i++) {
          transformAttributes(data[i].attributes);
        }
      } else {
        transformAttributes(data);
      }
    }
  };
};

export default JSONAPIAttributeTransformer;