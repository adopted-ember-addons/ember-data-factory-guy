import Ember from 'ember';
import $ from 'jquery';

/**
 * Attribute Transformer for JSONAPISerializer
 * The default transform is to dasherize.
 *
 * @constructor
 */
let JSONAPIAttributeTransformer = function (store) {
  let defaultValueTransformFn = function(x) { return x; };

  /**
   * Transform attributes in fixture.
   *
   * @param fixture
   * @returns {*} new copy of old fixture with transformed attributes
   */
  this.transform = function (modelName, fixture) {
    let newData, included = [];
    if (Ember.typeOf(fixture.data) === 'array') {
      newData = fixture.data.map(function (single) {
        let copy = $.extend(true, {}, single);
        transformSingle(modelName, copy);
        return copy;
      });
    } else {
      newData = $.extend(true, {}, fixture.data);
      transformSingle(modelName, newData);
    }
    if (fixture.included) {
      included = fixture.included.map(function (single) {
        let copy = $.extend(true, {}, single);
        transformSingle(modelName, copy);
        return copy;
      });
    }
    let newFixture = {data: newData};
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
  let transformSingle = function (modelName, fixture) {
    transformAttributes(modelName, fixture);
    findRelationships(modelName, fixture);
  };

  let transformAttributes = function(modelName, object) {
    if (object.attributes) {
      transformObjectValues(modelName, object.attributes);
      transformObjectKeys(modelName, object.attributes, 'Attribute');
    }
  };

  let transformRelationshipObjectKeys = function(modelName, object) {
    transformObjectKeys(modelName, object, 'Relationship');
  };

  var transformObjectKeys = function(modelName, object, keyType) {
    let serializer = store.serializerFor(modelName);
    let transformFunction = serializer['keyFor'+keyType] || Ember.String.dasherize;
    for (let key in object) {
      let value = object[key];
      let newKey = transformFunction(key);
      delete object[key];
      object[newKey] = value;
    }
  };

  /**
   Apply value transformers to attributes with custom type

   @param modelName
   @param object
   */
  let transformObjectValues = function(modelName, object) {
    let model = store.modelFor(modelName);
    for (let key in object) {
      let attributeType = Ember.get(model, 'transformedAttributes').get(key);
      let transformValue = getTransformValueFunction(attributeType);
      let value = object[key];
      object[key] = transformValue(value);
    }
  };

  /**
   Return a transform function for a custom attribute type (or the identity function otherwise).

   @param type
   */
  let getTransformValueFunction = function(type) {
    let container = Ember.getOwner ? Ember.getOwner(store) : store.container;
    return type ? container.lookup('transform:' + type).serialize : defaultValueTransformFn;
  };

  /**
   Recursively descend into the fixture json, looking for relationships
   whose attributes need transforming
   */
  let findRelationships = function (modelName, fixture) {
    let relationships = fixture.relationships;
    for (let key in relationships) {
      let data = relationships[key].data;
      if (Ember.typeOf(data) === 'array') {
        for (let i = 0, len = data.length; i < len; i++) {
          transformAttributes(modelName, data[i]);
        }
      } else {
        transformAttributes(modelName, data);
      }
    }
    transformRelationshipObjectKeys(modelName, fixture.relationships);
  };

};

export default JSONAPIAttributeTransformer;
