import Ember from 'ember';
import FixtureBuilder from './fixture-builder';
import JSONAPIFixtureConverter from './jsonapi-fixture-converter';
import JSONAPIAttributeTransformer from './jsonapi-attribute-transformer';

let createAttrs = (data) => {
  let attrs = data.attributes;
  attrs.id = data.id;
  return attrs;
};

// could be asking for attribute like 'id' or 'name',
// or relationship name which returns attributes
// no arg would be like unwrap, and return attributes
let getCommand = function(key) {
  let attrs;
  if (Ember.typeOf(this.data) === "array") {
    attrs = this.data.map((data)=> createAttrs(data));
    if (Ember.isEmpty(key)) {
      return attrs;
    }
    if (typeof key === 'number') {
      return attrs[key];
    }
    if (key === 'firstObject') {
      return attrs[0];
    }
    if (key === 'lastObject') {
      return attrs[attrs.length - 1];
    }
  } else {
    attrs = createAttrs(this.data);
    if (!key) {
      return attrs;
    }
    return attrs[key];
  }
};

/**
 Fixture Builder for JSONAPISerializer
 */
let JSONAPIJsonBuilder = function(store) {
  FixtureBuilder.call(this, store);

  this.updateHTTPMethod = 'PATCH';

  this.extractId = function(modelName, payload) {
    return Ember.get(payload, 'data.id');
  };

  this.convertForBuild = function(modelName, fixture) {
    let convertedFixture = new JSONAPIFixtureConverter(store).convert(modelName, fixture);
    let json = new JSONAPIAttributeTransformer(store).transform(modelName, convertedFixture);
    json.get = getCommand.bind(json);
    return json;
  };
};

export default JSONAPIJsonBuilder;
