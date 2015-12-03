import Ember from 'ember';
import DS from 'ember-data';
import JSONAPIFixtureBuilder from './jsonapi-fixture-builder';
import RESTFixtureBuilder from './rest-fixture-builder';

export default Ember.Object.extend({
  store: null,
  adapter: null,
  /**
   Return appropriate FixtureBuilder for the adapter type
   */
  fixtureBuilder: Ember.computed('store', {
    get() {
      if (this.usingJSONAPIAdapter()) {
        return new JSONAPIFixtureBuilder(this.get('store'));
      }
      if (this.usingRESTAdapter()) {
        return new RESTFixtureBuilder(this.get('store'));
      }
      return new JSONAPIFixtureBuilder(this.get('store'));
    }
  }),
  didInitialize: function() {
    this.set('adapter', this.get('store').adapterFor('application'));
  }.on('init'),
  /*
   Using json api?
   TODO: extract this to utility class
   */
  useJSONAPI() {
    return this.usingJSONAPIAdapter();
  },
  usingJSONAPIAdapter() {
    const adapter = this.get('adapter');
    return adapter && adapter instanceof DS.JSONAPIAdapter;
  },
  usingRESTAdapter() {
    const adapter = this.get('adapter');
    return adapter && adapter instanceof DS.RESTAdapter;
  }
});
