import FixtureBuilder from './fixture-builder';
import JSONAPIFixtureConverter from './jsonapi-fixture-converter';
import JSONAPIAttributeTransformer from './jsonapi-attribute-transformer';
//import Ember from 'ember';
/**
 Fixture Builder for JSONAPISerializer
 */
var JSONAPIJsonBuilder = function (store) {
  FixtureBuilder.call(this, store);

  this.convertForBuild = function (modelName, fixture) {
    var convertedFixture = new JSONAPIFixtureConverter(store).convert(modelName, fixture);
    return new JSONAPIAttributeTransformer(store).transform(modelName, convertedFixture);
  };
};

export default JSONAPIJsonBuilder;