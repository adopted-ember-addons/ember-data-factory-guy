import FixtureBuilder from './fixture-builder';
import JSONAPIConverter from './jsonapi-converter';
import AmsAttributeTransformer from './ams-attribute-transformer';

/**
 Fixture Builder for ActiveModelSerializer
 */
var AmsFixtureBuilder = FixtureBuilder.extend({

  convertForMake: function (modelName, fixture) {
    return new JSONAPIConverter(this.get('store')).convert(modelName, fixture);
  },

  convertForRequest: function (modelName, fixture) {
    return new AmsAttributeTransformer(this.get('store')).transform(modelName, fixture);
  },

  convertForCreateRequest: function (modelName, fixture) {
    var transformed = this._super(modelName, fixture);
    var finalJson = {};
    finalJson[modelName] = transformed;
    return finalJson;
  }

});

export default AmsFixtureBuilder;