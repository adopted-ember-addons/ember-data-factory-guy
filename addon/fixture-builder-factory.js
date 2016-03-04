import DS from 'ember-data';
import JSONAPIFixtureBuilder from './jsonapi-fixture-builder';
import RESTFixtureBuilder from './rest-fixture-builder';

export default class {

  constructor(store) {
    this.store = store;
    this.adapter = store.adapterFor('application');
  }

  /**
   Return appropriate FixtureBuilder for the adapter type
   */
  fixtureBuilder() {
    if (this.usingJSONAPIAdapter()) {
      return new JSONAPIFixtureBuilder(this.store);
    }
    if (this.usingRESTAdapter()) {
      return new RESTFixtureBuilder(this.store);
    }
    return new JSONAPIFixtureBuilder(this.store);
  }

  usingJSONAPIAdapter() {
    return this.adapter && this.adapter instanceof DS.JSONAPIAdapter;
  }

  usingRESTAdapter() {
    return this.adapter && this.adapter instanceof DS.RESTAdapter;
  }
}