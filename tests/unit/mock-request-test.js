import Ember from 'ember';
import FactoryGuy, {
  make, makeList, build, buildList, clearStore,
  mockFind, mockFindAll, mockReload, mockQuery, mockQueryRecord,
  mockCreate, mockUpdate, mockDelete, mockSetup
} from 'ember-data-factory-guy';
import {inlineSetup} from '../helpers/utility-methods';
import MockRequest from 'ember-data-factory-guy/mocks/mock-request';

let App = null;
const serializerType = '-json-api';

module('mockSetup', inlineSetup(App));

test("accepts parameters", function() {
  FactoryGuy.logLevel = 0;
  Ember.$.mockjaxSettings.responseTime = 0;
  Ember.$.mockjaxSettings.logging = 0;

  mockSetup({logLevel: 1});
  equal(FactoryGuy.logLevel, 1);

  mockSetup({responseTime: 10});
  equal(Ember.$.mockjaxSettings.responseTime, 10);

  mockSetup({mockjaxLogLevel: 4});
  equal(Ember.$.mockjaxSettings.logging, 4);

  FactoryGuy.logLevel = 0;
  Ember.$.mockjaxSettings.responseTime = 0;
  Ember.$.mockjaxSettings.logging = 0;
});


module('MockRequest #fails', inlineSetup(App));

test("status must be 3XX, 4XX or 5XX", function(assert) {
  const mock = new MockRequest('user');

  assert.throws(()=> {
    mock.fails({ status: 201 });
  });
  assert.throws(()=> {
    mock.fails({ status: 292 });
  });
  assert.throws(()=> {
    mock.fails({ status: 104 });
  });

  ok(mock.fails({ status: 300 }) instanceof MockRequest);
  ok(mock.fails({ status: 303 }) instanceof MockRequest);
  ok(mock.fails({ status: 401 }) instanceof MockRequest);
  ok(mock.fails({ status: 521 }) instanceof MockRequest);
});

test("with convertErrors not set, the errors are converted to JSONAPI formatted errors", function() {
  const mock = new MockRequest('user');
  let errors = { errors: { phrase: 'poorly worded' } };
  mock.fails({ response: errors });
  deepEqual(mock.errorResponse, {
    errors: [
      {
        detail: 'poorly worded',
        source: { pointer: "data/attributes/phrase" },
        title: 'invalid phrase'
      }
    ]
  });
});

test("with convertErrors set to false, does not convert errors", function() {
  const mock = new MockRequest('user');
  let errors = { errors: { phrase: 'poorly worded' } };
  mock.fails({ response: errors, convertErrors: false });
  deepEqual(mock.errorResponse, errors);
});

test("with errors response that will be converted but does not have errors as object key", function(assert) {
  const mock = new MockRequest('user');
  let errors = { phrase: 'poorly worded' };
  assert.throws(()=> {
    mock.fails({ response: errors, convertErrors: true });
  });
});

module('MockRequest#timeCalled', inlineSetup(App, serializerType));

test("can verify how many times a queryRecord call was mocked", function(assert) {
  Ember.run(()=> {
    const done = assert.async();
    const mock = mockQueryRecord('company', {}).returns({ json: build('company') });

    FactoryGuy.store.queryRecord('company', {}).then(()=> {
      FactoryGuy.store.queryRecord('company', {}).then(()=> {
        equal(mock.timesCalled, 2);
        done();
      });
    });
  });
});

test("can verify how many times a findAll call was mocked", function(assert) {
  Ember.run(()=> {
    const done = assert.async();
    const mock = mockFindAll('company');

    FactoryGuy.store.findAll('company').then(()=> {
      FactoryGuy.store.findAll('company').then(()=> {
        equal(mock.timesCalled, 2);
        done();
      });
    });
  });
});

test("can verify how many times an update call was mocked", function(assert) {
  Ember.run(()=> {
    const done = assert.async();
    const company = make('company');
    const mock = mockUpdate(company);

    company.set('name', 'ONE');
    company.save().then(()=> {
      company.set('name', 'TWO');
      company.save().then(()=> {
        equal(mock.timesCalled, 2);
        done();
      });
    });
  });
});

module('MockRequest#basicRequestMatches', inlineSetup(App, serializerType));

test("fails if the types don't match", function(assert) {
  const mock = new MockRequest('user');
  const getType = sinon.stub(mock, 'getType').returns('POST');
  const getUrl = sinon.stub(mock, 'getUrl').returns('/api/ember-data-factory-guy');

  const settings = {
    type: 'GET',
    url: '/api/ember-data-factory-guy'
  };

  assert.ok(!mock.basicRequestMatches(settings));
});

test("fails if the URLs don't match", function(assert) {
  const mock = new MockRequest('user');
  const getType = sinon.stub(mock, 'getType').returns('GET');
  const getUrl = sinon.stub(mock, 'getUrl').returns('/api/ember-data-factory-guy');

  const settings = {
    type: 'GET',
    url: '/api/ember-data-factory-guy/123'
  };

  assert.ok(!mock.basicRequestMatches(settings));
});

test("succeeds if the URLs and the types match", function(assert) {
  const mock = new MockRequest('user');
  const getType = sinon.stub(mock, 'getType').returns('GET');
  const getUrl = sinon.stub(mock, 'getUrl').returns('/api/ember-data-factory-guy');

  const settings = {
    type: 'GET',
    url: '/api/ember-data-factory-guy'
  };

  assert.ok(mock.basicRequestMatches(settings));
});

test("succeeds even if the given URL has query parameters that don't match", function(assert) {
  const mock = new MockRequest('user');
  const getType = sinon.stub(mock, 'getType').returns('GET');
  const getUrl = sinon.stub(mock, 'getUrl').returns('/api/ember-data-factory-guy');

  const settings = {
    type: 'GET',
    url: '/api/ember-data-factory-guy?page=2'
  };

  assert.ok(mock.basicRequestMatches(settings));
});


module('mockFind', inlineSetup(App, serializerType));

test("has access to handler being used by mockjax", function() {
  let mock = mockFind('user');
  ok(mock.handler);
});

test("#get method to access payload", function() {
  let mock = mockFind('user');
  equal(mock.get('name'), 'User1');
});


module('mockFind #getUrl', inlineSetup(App));

test("with proxy", function() {
  const json = build('user');
  const mock = mockFind('user').returns({ json });
  equal(mock.getUrl(), '/users/1');
});

test("with json", function() {
  const json = { id: 1, name: "Dan" };
  const mock = mockFind('user').returns({ json });
  equal(mock.getUrl(), '/users/1');
});


module('mockFind #fails', inlineSetup(App));

test("with errors in response", function(assert) {
  Ember.run(()=> {
    const done = assert.async();

    const response = { errors: { description: ['bad'] } };
    const mock = mockFind('profile', 1).fails({ response });

    FactoryGuy.store.findRecord('profile', 1)
      .catch((res)=> {
        equal(mock.timesCalled, 1);
        ok(true);
        done();
      });
  });
});


module('mockFindAll', inlineSetup(App, serializerType));

test("have access to handler being used by mockjax", function() {
  let mock = mockFindAll('user');
  ok(mock.handler);
});

test("#get method to access payload", function() {
  let mock = mockFindAll('user', 2);
  deepEqual(mock.get(0), { id: 1, name: 'User1', style: 'normal' });
});


module('mockQuery', inlineSetup(App, serializerType));

test("#get method to access payload", function() {
  let json = buildList('user', 2)
  let mock = mockQuery('user', {}).returns({ json });
  deepEqual(mock.get(0), json.get(0));
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

test("#get method to access payload", function() {
  let json = build('user')
  let mock = mockQueryRecord('user', {}).returns({ json });
  deepEqual(mock.get(), json.get());
});

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

  FactoryGuy.store.queryRecord('company', queryParams).catch(()=> {
  });
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

});

test("using returns when only setting modelName", function(assert) {
  assert.throws(function() {
    mockUpdate('profile').returns({});
  }, "can't user returns when only specifying modelName");

});


