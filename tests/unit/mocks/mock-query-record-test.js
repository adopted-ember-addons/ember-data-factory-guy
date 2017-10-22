import Ember from 'ember';
import {moduleFor, test} from 'ember-qunit';
import FactoryGuy, {build, makeList, mockQueryRecord} from 'ember-data-factory-guy';
import {inlineSetup} from '../../helpers/utility-methods';
import sinon from 'sinon';

const serializerType = '-json-api';

moduleFor('serializer:application', 'mockQueryRecord', inlineSetup(serializerType));

test("#get method to access payload", function(assert) {
  let json = build('user');
  let mock = mockQueryRecord('user', {}).returns({ json });
  assert.deepEqual(mock.get(), json.get());
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

test("the mock handler is assigned an index", function(assert) {
  let mock = mockQueryRecord('user');
  assert.equal(mock.index, 'GET /users-1')
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
  const queryParams = { name: 'MyCompany' };
  const handler = mockQueryRecord('company', queryParams);
  handler.returns({ headers: { 'X-Testing': 'absolutely' } });
  let {headers} = handler.getResponse();
  assert.deepEqual(headers, { 'X-Testing': 'absolutely' });

  Ember.$(document).ajaxComplete(function(event, xhr) {
    assert.equal(xhr.getResponseHeader('X-Testing'), 'absolutely');
    Ember.$(document).off('ajaxComplete');
    done();
  });

  FactoryGuy.store.queryRecord('company', queryParams).catch(() =>{});
});

test("using returns 'model' with array of DS.Models throws error", function(assert) {
  assert.throws(function() {
    let bobs = makeList('user', 2, { name: 'Bob' });
    mockQueryRecord('user', { name: 'Bob' }).returns({ model: bobs });
  }, "can't pass array of models to mock queryRecord");
});

test("#getUrl uses urlForQueryRecord if it is set on the adapter", function(assert) {
  let queryParams = { zip: 'it' };
  let mock1 = mockQueryRecord('user', queryParams);

  assert.equal(mock1.getUrl(), '/users');

  let adapter = FactoryGuy.store.adapterFor('user');
  sinon.stub(adapter, 'urlForQueryRecord').withArgs(queryParams, 'user').returns('/dudes');

  assert.equal(mock1.getUrl(), '/dudes');
  adapter.urlForQueryRecord.restore();
});

