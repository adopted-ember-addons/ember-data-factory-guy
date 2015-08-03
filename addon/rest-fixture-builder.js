import FixtureBuilder from './fixture-builder';
import JSONAPIConverter from './jsonapi-converter';
import AmsAttributeTransformer from './ams-attribute-transformer';

var RESTFixtureBuilder = FixtureBuilder.extend({
  converterClass: JSONAPIConverter,
  transformerClass: AmsAttributeTransformer,

  convertForMake: function (modelName, fixture) {
    return this.convertFixture(modelName, fixture);
  },

  //convertForFindRequest: function (modelName, fixture) {
  //  var transformer = new AmsAttributeTransformer(this.get('store'));
  //  return transformer.transform(modelName, fixture);
  //},

  convertForCreateRequest: function (modelName, fixture) {
    var transformed = this._super(modelName, fixture);
    var finalJson = {};
    finalJson[modelName] = transformed;
    return finalJson;
  }

});

export default RESTFixtureBuilder;