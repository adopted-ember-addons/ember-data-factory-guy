import Ember from 'ember';
import FixtureBuilder from './fixture-builder';
import JSONAPIFixtureConverter from '../converter/jsonapi-fixture-converter';
//import JSONAPIAttributeTransformer from '../jsonapi-attribute-transformer';
import JSONAPIPayload from '../payload/json-api-payload';

/**
 Fixture Builder for JSONAPISerializer
 */
class JSONAPIJsonBuilder extends FixtureBuilder {

  constructor(store) {
    super(store);
    this.updateHTTPMethod = 'PATCH';
  }

  extractId(modelName, payload) {
    return Ember.get(payload, 'data.id');
  }

  convertForBuild(modelName, fixture) {
    let converter = new JSONAPIFixtureConverter(this.store);
    let json =  converter.convert(modelName, fixture);
    //let json = convertedFixture;
    //let json = (new JSONAPIAttributeTransformer(this.store)).transform(modelName, convertedFixture);
    new JSONAPIPayload(modelName, json, converter.listType);
    return json;
  }
}

export default JSONAPIJsonBuilder;
