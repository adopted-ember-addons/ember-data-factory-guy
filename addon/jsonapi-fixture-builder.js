import FixtureBuilder from './fixture-builder';
import JSONAPIConverter from './jsonapi-converter';
import JSONAPIAttributeTransformer from './jsonapi-attribute-transformer';

/**
 Fixture Builder for JSONAPISerializer
 */
var JSONAPIJsonBuilder = FixtureBuilder.extend({
  converterClass: JSONAPIConverter,
  transformerClass: JSONAPIAttributeTransformer,

  convertForBuild: function(modelName, fixture) {
    var convertedFixture =  this.convertFixture(modelName, fixture);
    return this.transformAttributes(modelName, convertedFixture);
  },

  convertForMake: function(modelName, fixture) {
    return this.convertFixture(modelName, fixture);
  }

});

export default JSONAPIJsonBuilder;