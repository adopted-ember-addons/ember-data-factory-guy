import FixtureBuilderFactory from 'ember-data-factory-guy/builder/fixture-builder-factory';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import DS from 'ember-data';
import DRFSerializer from 'ember-django-adapter/serializers/drf';
import { ActiveModelSerializer } from 'active-model-adapter';
import JSONAPIFixtureBuilder from 'ember-data-factory-guy/builder/jsonapi-fixture-builder';
import RESTFixtureBuilder from 'ember-data-factory-guy/builder/rest-fixture-builder';
import JSONFixtureBuilder from 'ember-data-factory-guy/builder/json-fixture-builder';
import DRFFixtureBuilder from 'ember-data-factory-guy/builder/drf-fixture-builder';
import ActiveModelFixtureBuilder from 'ember-data-factory-guy/builder/active-model-fixture-builder';
import { inlineSetup } from "../helpers/utility-methods";

let factory, store;
module('FixtureBuilderFactory', function(hooks) {
  setupTest(hooks);
  inlineSetup(hooks, '-json-api');

  hooks.beforeEach(function() {
    store = this.owner.lookup('service:store');
    factory = new FixtureBuilderFactory(store);
  });

  test("returns the correct fixtureBuilder for serializer type of modelName", function(assert) {
    let tests = [
      // serializer type   expected FixtureBuilder
      [DS.RESTSerializer, RESTFixtureBuilder],
      [DS.JSONSerializer, JSONFixtureBuilder],
      [ActiveModelSerializer, ActiveModelFixtureBuilder],
      [DRFSerializer, DRFFixtureBuilder],
      [DS.JSONAPISerializer, JSONAPIFixtureBuilder],
      [null, JSONAPIFixtureBuilder]
    ];

    let serializer;
    store.serializerFor = () => serializer;
    let modelName = 'application';

    for (let test of tests) {
      let [serializerType, expectedFixtureBuilder] = test;
      serializer = serializerType && (new serializerType);
      let fixtureBuilder = factory.fixtureBuilder(modelName);
      assert.ok(fixtureBuilder instanceof expectedFixtureBuilder, `${serializerType} returns ${expectedFixtureBuilder.name}`);
    }
  });
});
