import FixtureBuilder from './fixture-builder';
import JSONAPIConverter from './jsonapi-converter';
import JSONAPIAttributeTransformer from './jsonapi-attribute-transformer';

var JSONAPIJsonBuilder = FixtureBuilder.extend({

  convertForBuild: function (modelName, fixture) {
    return new JSONAPIConverter(this.get('store')).convert(modelName, fixture);
  },

  convertForRequest: function (modelName, fixture) {
    return new JSONAPIAttributeTransformer().transform(fixture);
  }
});

export default JSONAPIJsonBuilder;