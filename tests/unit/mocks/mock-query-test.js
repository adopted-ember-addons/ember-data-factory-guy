import {moduleFor, test} from 'ember-qunit';
import FactoryGuy, {make, buildList, mockQuery} from 'ember-data-factory-guy';
import {inlineSetup} from '../../helpers/utility-methods';
import sinon from 'sinon';

const serializerType = '-json-api';

moduleFor('serializer:application', 'MockQuery', inlineSetup(serializerType));

test("#get method to access payload", function(assert) {
  let json = buildList('user', 2);
  let mock = mockQuery('user', {}).returns({ json });
  assert.deepEqual(mock.get(0), json.get(0));
});

test("json payload argument should be an object", function(assert) {
  assert.throws(function() {
    mockQuery('user', 'name', {});
  }, "query argument should not be a string");

  assert.throws(function() {
    mockQuery('user', ['name'], {});
  }, "query argument should not be an array");
});

test("mock query returns() accepts only ids, or models or json keys", function(assert) {
  const handler = mockQuery('user', { name: 'Bob' });
  // In those tests, values don't matter
  assert.throws(() => {
    handler.returns({
      ids: undefined,
      models: undefined
    });
  });

  assert.throws(() => {
    handler.returns({
      ids: undefined,
      json: undefined
    });
  });

  assert.throws(() => {
    handler.returns({
      models: undefined,
      json: undefined
    });
  });

  assert.throws(() => {
    handler.returns({
      ids: undefined,
      models: undefined,
      json: undefined
    });
  });
});

test("mock query using returns with an instance of DS.Model throws error", function(assert) {
  assert.throws(function() {
    let models = make('user', { name: 'Bob' });
    mockQuery('user', { name: 'Bob' }).returns({ models });
  }, "can't pass a DS.Model instance to mock query");
});

test("mock has mockId", function(assert) {
  let mock = mockQuery('user');
  assert.deepEqual(mock.mockId, { type: 'GET', url: '/users', num: 0 });
});

test("#getUrl uses urlForQuery if it is set on the adapter", function(assert) {
  let queryParams = { zip: 'it' };
  let mock1 = mockQuery('user', queryParams);
  assert.equal(mock1.getUrl(), '/users');

  let adapter = FactoryGuy.store.adapterFor('user');
  sinon.stub(adapter, 'urlForQuery').withArgs(queryParams, 'user').returns('/dudes');

  assert.equal(mock1.getUrl(), '/dudes');
  adapter.urlForQuery.restore();
});
