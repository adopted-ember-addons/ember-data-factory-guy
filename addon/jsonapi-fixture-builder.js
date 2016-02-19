import Ember from 'ember';
import FixtureBuilder from './fixture-builder';
import JSONAPIFixtureConverter from './jsonapi-fixture-converter';
import JSONAPIAttributeTransformer from './jsonapi-attribute-transformer';

let createAttrs = (data) => {
  let attrs = data.attributes;
  attrs.id = data.id;
  return attrs;
};

/**
 Fixture Builder for JSONAPISerializer
 */
let JSONAPIJsonBuilder = function (store) {
  FixtureBuilder.call(this, store);

  this.updateHTTPMethod = 'PATCH';

  this.unwrap = function() {
    if (Ember.typeOf(this.data) === "array") {
      return this.data.map((data)=> createAttrs(data));
    } else {
      return createAttrs(this.data);
    }
  };

  this.extractId = function (modelName, payload) {
    return Ember.get(payload, 'data.id');
  };

  this.convertForBuild = function (modelName, fixture) {
    let convertedFixture = new JSONAPIFixtureConverter(store).convert(modelName, fixture);
    let json = new JSONAPIAttributeTransformer(store).transform(modelName, convertedFixture);
    json.unwrap = this.unwrap.bind(json);
    return json;
  };
};

export default JSONAPIJsonBuilder;
