import JSONAPISerializer from '@ember-data/serializer/json-api';
import JSONSerializer from '@ember-data/serializer/json';
import RESTSerializer from '@ember-data/serializer/rest';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { ActiveModelSerializer } from 'active-model-adapter';
import {
  JSONAPIFixtureBuilder,
  RESTFixtureBuilder,
  JSONFixtureBuilder,
  ActiveModelFixtureBuilder,
} from 'ember-data-factory-guy';
import { FixtureBuilderFactory } from 'ember-data-factory-guy/-private';
import { inlineSetup } from '../helpers/utility-methods';

module('FixtureBuilderFactory', function (hooks) {
  setupTest(hooks);
  inlineSetup(hooks, '-json-api');

  hooks.beforeEach(function () {
    this.store = this.owner.lookup('service:store');
    this.factory = new FixtureBuilderFactory(this.store);
  });

  test('returns the correct fixtureBuilder for serializer type of modelName', function (assert) {
    assert.expect(5);
    let tests = [
      // serializer type   expected FixtureBuilder
      [RESTSerializer, RESTFixtureBuilder],
      [JSONSerializer, JSONFixtureBuilder],
      [ActiveModelSerializer, ActiveModelFixtureBuilder],
      [JSONAPISerializer, JSONAPIFixtureBuilder],
      [null, JSONAPIFixtureBuilder],
    ];

    let serializer;
    this.store.serializerFor = () => serializer;
    let modelName = 'application';

    for (let test of tests) {
      let [serializerType, expectedFixtureBuilder] = test;
      serializer = serializerType && serializerType.create();
      let fixtureBuilder = this.factory.fixtureBuilder(modelName);
      assert.ok(
        fixtureBuilder instanceof expectedFixtureBuilder,
        `${serializerType} returns ${expectedFixtureBuilder.name}`,
      );
    }
  });
});
