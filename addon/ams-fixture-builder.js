import FixtureBuilder from './fixture-builder';
import JSONAPIConverter from './jsonapi-converter';
import AmsAttributeTransformer from './ams-attribute-transformer';

/**
 Fixture Builder for ActiveModelSerializer
 */
var AmsFixtureBuilder = FixtureBuilder.extend({
  converterClass: JSONAPIConverter,
  transformerClass: AmsAttributeTransformer,

  convertForBuild(modelName, fixture) {
    return this.transformAttributes(modelName, fixture);
  },

  convertForMake: function (modelName, fixture) {
    return this.convertFixture(modelName, fixture);
  },

  convertForFindAllRequest: function (modelName, fixture) {
    return this.transformAttributes(modelName, fixture);
  },
  convertForCreateRequest(modelName, fixture) {
    var json = {};
    json[modelName]=fixture;
    return json;
  }
});

export default AmsFixtureBuilder;