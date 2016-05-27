import Ember from 'ember';
import FactoryGuy, {
  make, makeList, build, buildList, clearStore,
  mockFind, mockFindAll, mockReload, mockQuery, mockQueryRecord,
  mockCreate, mockUpdate, mockDelete
} from 'ember-data-factory-guy';
import { inlineSetup } from '../helpers/utility-methods';

let App = null;
let serializerType = '-json-api';

/**
 These tests are testing basic functionality of the mocks so the serializer type
 is not important
 */
module('mockFind', inlineSetup(App, serializerType));

test("have access to handler being used by mockjax", function() {
  let mock = mockFind('user');
  ok(mock.handler);
});


module('mockFindAll', inlineSetup(App, serializerType));

test("have access to handler being used by mockjax", function() {
  let mock = mockFindAll('user');
  ok(mock.handler);
});

module('mockQuery', inlineSetup(App, serializerType));

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
  assert.throws(()=> {
    handler.returns({
      ids: undefined,
      models: undefined
    });
  });

  assert.throws(()=> {
    handler.returns({
      ids: undefined,
      json: undefined
    });
  });

  assert.throws(()=> {
    handler.returns({
      models: undefined,
      json: undefined
    });
  });

  assert.throws(()=> {
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

test("have access to handler being used by mockjax", function() {
  let mock = mockQuery('user');
  ok(mock.handler);
});


module('mockQueryRecord', inlineSetup(App, serializerType));

test("returns() method accepts only id, model, json or header as keys", function(assert) {
  const handler = mockQueryRecord('user');

  assert.throws(()=> {
    handler.returns({
      ids: undefined,
    });
  });

  assert.throws(()=> {
    handler.returns({
      models: undefined,
    });
  });

  assert.throws(()=> {
    handler.returns({
      id: undefined,
      model: undefined
    });
  });

  assert.throws(()=> {
    handler.returns({
      id: undefined,
      json: undefined
    });
  });

  assert.throws(()=> {
    handler.returns({
      model: undefined,
      json: undefined
    });
  });

  assert.throws(()=> {
    handler.returns({
      id: undefined,
      model: undefined,
      json: undefined
    });
  });
});

test("have access to handler being used by mockjax", function() {
  let mock = mockQueryRecord('user');
  ok(mock.handler);
});

test("using fails makes the request fail", function(assert) {
  Ember.run(()=> {
    let done = assert.async();

    mockQueryRecord('user').fails();
    FactoryGuy.store.queryRecord('user', {})
      .catch(()=> {
        ok(true);
        done();
      });

  });
});

test("using returns with headers adds the headers to the response", function(assert) {
  var done = assert.async();

  const queryParams = { name: 'MyCompany' };
  const handler = mockQueryRecord('company', queryParams);
  handler.returns({ headers: { 'X-Testing': 'absolutely' } });

  $(document).ajaxComplete(function(event, xhr) {
    assert.equal(xhr.getResponseHeader('X-Testing'), 'absolutely');
    $(document).off('ajaxComplete');
    done();
  });

  FactoryGuy.store.queryRecord('company', queryParams).catch(()=>{});
});

test("using returns 'model' with array of DS.Models throws error", function(assert) {
  assert.throws(function() {
    let bobs = makeList('user', 2, { name: 'Bob' });
    mockQueryRecord('user', { name: 'Bob' }).returns({ model: bobs });
  }, "can't pass array of models to mock queryRecord");
});


module('mockUpdate', inlineSetup(App));

test("with incorrect parameters", function(assert) {
  assert.throws(function() {
    mockUpdate();
  }, "missing everything");
  assert.throws(function() {
    mockUpdate('profile');
  }, "missing id");
  assert.throws(function() {
    mockUpdate('profile', {});
  }, "missing id");
});