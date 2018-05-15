import Ember from 'ember';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import FactoryGuy, { build, make, makeList, mockQueryRecord } from 'ember-data-factory-guy';
import { inlineSetup2 } from '../../helpers/utility-methods';
import sinon from 'sinon';

const serializerType = '-json-api';

module('MockQueryRecord', function(hooks) {
  setupTest(hooks);
  inlineSetup2(hooks, serializerType);


  test("#get method to access payload", function(assert) {
    let json = build('user');
    let mock = mockQueryRecord('user', {}).returns({json});
    assert.deepEqual(mock.get(), json.get());
  });

  test("logging response", async function(assert) {
    FactoryGuy.settings({logLevel: 1});

    const queryParams = {include: 'company'},
          consoleStub = sinon.spy(console, 'log'),
          mock        = mockQueryRecord('profile').withParams(queryParams);

    await Ember.run(async () => FactoryGuy.store.queryRecord('profile', queryParams));

    let response     = JSON.parse(mock.actualResponseJson()),
        expectedArgs = [
          "[factory-guy]",
          "MockQueryRecord",
          "GET",
          "[200]",
          `/profiles?${Ember.$.param(queryParams)}`,
          response
        ];

    assert.deepEqual(consoleStub.getCall(0).args, expectedArgs);

    console.log.restore();
  });

  test("returns() method accepts only id, model, json or header as keys", function(assert) {
    const handler = mockQueryRecord('user');

    assert.throws(() => {
      handler.returns({
        ids: undefined,
      });
    });

    assert.throws(() => {
      handler.returns({
        models: undefined,
      });
    });

    assert.throws(() => {
      handler.returns({
        id: undefined,
        model: undefined
      });
    });

    assert.throws(() => {
      handler.returns({
        id: undefined,
        json: undefined
      });
    });

    assert.throws(() => {
      handler.returns({
        model: undefined,
        json: undefined
      });
    });

    assert.throws(() => {
      handler.returns({
        id: undefined,
        model: undefined,
        json: undefined
      });
    });
  });

  test("mockId", function(assert) {
    let mock = mockQueryRecord('user');
    assert.deepEqual(mock.mockId, {type: 'GET', url: '/users', num: 0});
  });

  test("using fails makes the request fail", function(assert) {
    Ember.run(() => {
      let done = assert.async();

      mockQueryRecord('user').fails();
      FactoryGuy.store.queryRecord('user', {})
                .catch(() => {
                  assert.ok(true);
                  done();
                });

    });
  });

  test("using returns with headers adds the headers to the response", function(assert) {
    let done = assert.async();
    const queryParams = {name: 'MyCompany'};
    const handler = mockQueryRecord('company', queryParams);
    handler.returns({headers: {'X-Testing': 'absolutely'}});
    let {headers} = handler.getResponse();
    assert.deepEqual(headers, {'X-Testing': 'absolutely'});

    Ember.$(document).ajaxComplete(function(event, xhr) {
      assert.equal(xhr.getResponseHeader('X-Testing'), 'absolutely');
      Ember.$(document).off('ajaxComplete');
      done();
    });

    FactoryGuy.store.queryRecord('company', queryParams).catch(() => {
    });
  });

  test("using returns 'model' with array of DS.Models throws error", function(assert) {
    assert.throws(function() {
      let bobs = makeList('user', 2, {name: 'Bob'});
      mockQueryRecord('user', {name: 'Bob'}).returns({model: bobs});
    }, "can't pass array of models to mock queryRecord");
  });

  test("#getUrl uses urlForQueryRecord if it is set on the adapter", async function(assert) {
    assert.expect(3);

    let queryParams = {zip: 'it'},
        adapter     = FactoryGuy.store.adapterFor('user'),
        user        = make('user');

    adapter.urlForQueryRecord = (query) => {
      assert.ok(query === queryParams, 'query params are passed in');
      return '/users';
    };

    mockQueryRecord('user', queryParams).returns({model: user});

    await FactoryGuy.store.queryRecord('user', queryParams);
  });
});
