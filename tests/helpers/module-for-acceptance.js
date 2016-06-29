import { module } from 'qunit';
import startApp from './start-app';
import destroyApp from './destroy-app';
import FactoryGuy, {mockSetup, mockTeardown} from 'ember-data-factory-guy';
import JSONAPIFixtureBuilder from 'ember-data-factory-guy/builder/jsonapi-fixture-builder';

export default function(name, options = {}) {
  module(name, {
    beforeEach() {
      this.application = startApp();

      drfReset(this.application); // custom hackery for testing with drf

      // Adding FactoryGuy mockSetup call
      mockSetup();

      // If you want to check if your mocks are handling response
      // and also see what the mocks are returning
      // mockSetup({logLevel:1});

      if (options.beforeEach) {
        options.beforeEach.apply(this, arguments);
      }
    },

    afterEach() {
      destroyApp(this.application);

      // Adding FactoryGuy mockTeardown call
      mockTeardown();

      if (options.afterEach) {
        options.afterEach.apply(this, arguments);
      }
    }
  });
}

/**
 * The unintended consiquence of testing for DRF adapter/serializer, is that this ember django addon
 * makes itself the default adapter/serializer pair and overrides my default application adapter.
 * So, I have to brute force it back to JSONAPI adapter/serializers
 *
 * DRF adapter / serializer does not handle sideloading and many of these tests use that to load
 * their relationships, otherwise I would not care.
 *
 * @param application
 */
let drfReset = function(application) {
  let container = application.__container__;
  let store = FactoryGuy.store;
  FactoryGuy.fixtureBuilder = new JSONAPIFixtureBuilder(store);
  let findSerializer = store.serializerFor.bind(store);
  let adapter = container.lookup('adapter:-json-api');
  store.adapterFor = function() { return adapter; };
  let serializer = container.lookup('serializer:-json-api');
  store.serializerFor = function(modelName) {
    let originalSerializer = findSerializer(modelName);
    // these models are ember-model-fragments so they do their own thing
    if (modelName.match(/(name|department|address|department-employment|manager)/)) {
      return originalSerializer;
    }
    return serializer;
  };
  adapter.store = store;
  serializer.store = store;
};