import RESTSerializer from '@ember-data/serializer/rest';
import JSONAPISerializer from '@ember-data/serializer/json-api';
import JSONAPIFixtureBuilder from './jsonapi-fixture-builder';
import RESTFixtureBuilder from './rest-fixture-builder';

export default class {
  constructor(store) {
    this.store = store;
  }

  /**
   Return appropriate FixtureBuilder for the model's serializer type
   */
  fixtureBuilder(modelName) {
    let serializer = this.store.serializerFor(modelName);
    if (!serializer) {
      return new JSONAPIFixtureBuilder(this.store);
    }
    if (this.usingJSONAPISerializer(serializer)) {
      return new JSONAPIFixtureBuilder(this.store);
    }
    if (this.usingRESTSerializer(serializer)) {
      return new RESTFixtureBuilder(this.store);
    }
    return new JSONAPIFixtureBuilder(this.store);
  }

  usingJSONAPISerializer(serializer) {
    return serializer instanceof JSONAPISerializer;
  }

  usingRESTSerializer(serializer) {
    return serializer instanceof RESTSerializer;
  }
}
