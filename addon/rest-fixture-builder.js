import FixtureBuilder from './fixture-builder';
import JSONAPIConverter from './jsonapi-converter';

var RESTFixtureBuilder = FixtureBuilder.extend({

  convertForMake: function (modelName, fixture) {
    //convert to json api
    var converter = new JSONAPIConverter(this.get('store'));
    return converter.convert(modelName, fixture);
  },

  //convertForRequest: function (modelName, fixture) {
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