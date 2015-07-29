import FixtureBuilder from './fixture-builder';
import JSONAPIConverter from './jsonapi-converter';
import JSONAPIAttributeTransformer from './jsonapi-attribute-transformer';

var JSONAPIJsonBuilder = FixtureBuilder.extend({

  convertForBuild: function (modelName, fixture) {
    var converter = new JSONAPIConverter(this.get('store'));
    return converter.convert(modelName, fixture);
  },

  convertForRequest: function (modelName, fixture) {
    var transformer = new JSONAPIAttributeTransformer();
    return transformer.transform(fixture);
  }
});

export default JSONAPIJsonBuilder;