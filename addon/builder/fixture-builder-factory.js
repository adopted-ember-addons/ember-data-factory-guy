import DS from 'ember-data';
import JSONAPIFixtureBuilder from './jsonapi-fixture-builder';
import RESTFixtureBuilder from './rest-fixture-builder';
import JSONFixtureBuilder from './json-fixture-builder';
import DRFFixtureBuilder from './drf-fixture-builder';

export default class {

  constructor(store) {
    this.store = store;
    this.adapter = store.adapterFor('application');
    this.serializer = store.serializerFor('application');
  }

  /**
   Return appropriate FixtureBuilder for the serializer type
   */
  fixtureBuilder() {
    if (this.usingJSONAPISerializer()) {
      return new JSONAPIFixtureBuilder(this.store);
    }
    if (this.usingDRFSerializer()) {
      return new DRFFixtureBuilder(this.store);
    }
    if (this.usingRESTSerializer()) {
      return new RESTFixtureBuilder(this.store);
    }
    return new JSONFixtureBuilder(this.store);
  }

  usingJSONAPISerializer() {
    return this.serializer && this.serializer instanceof DS.JSONAPISerializer;
  }

  usingDRFSerializer() {
    return this.serializer && this.adapter.defaultSerializer === 'DS/djangoREST';
  }

  usingRESTSerializer() {
    return this.serializer && this.serializer instanceof DS.RESTSerializer;
  }
}