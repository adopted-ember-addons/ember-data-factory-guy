import {moduleFor, test} from 'ember-qunit';
import Ember from 'ember';
import FactoryGuy, {
  make, makeList, build, buildList, clearStore,
  mockFindRecord, mockFindAll, mockReload, mockQuery, mockQueryRecord,
  mockCreate, mockUpdate, mockDelete, mockSetup
} from 'ember-data-factory-guy';
import {inlineSetup} from '../helpers/utility-methods';
import MockRequest from 'ember-data-factory-guy/mocks/mock-request';

const serializerType = '-json-api';

moduleFor('serializer:application', 'mockSetup', inlineSetup(serializerType));

test("accepts parameters", function(assert) {
  FactoryGuy.logLevel = 0;
  Ember.$.mockjaxSettings.responseTime = 0;
  Ember.$.mockjaxSettings.logging = 0;

  mockSetup({logLevel: 1});
  assert.equal(FactoryGuy.logLevel, 1);

  mockSetup({responseTime: 10});
  assert.equal(Ember.$.mockjaxSettings.responseTime, 10);

  mockSetup({mockjaxLogLevel: 4});
  assert.equal(Ember.$.mockjaxSettings.logging, 4);

  FactoryGuy.logLevel = 0;
  Ember.$.mockjaxSettings.responseTime = 0;
  Ember.$.mockjaxSettings.logging = 0;
});


moduleFor('serializer:application', 'MockRequest #fails', inlineSetup(serializerType));

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

  assert.ok(mock.fails({ status: 300 }) instanceof MockRequest);
  assert.ok(mock.fails({ status: 303 }) instanceof MockRequest);
  assert.ok(mock.fails({ status: 401 }) instanceof MockRequest);
  assert.ok(mock.fails({ status: 521 }) instanceof MockRequest);
});

test("with convertErrors not set, the errors are converted to JSONAPI formatted errors", function(assert) {
  const mock = new MockRequest('user');
  let errors = { errors: { phrase: 'poorly worded' } };
  mock.fails({ response: errors });
  assert.deepEqual(mock.errorResponse, {
    errors: [
      {
        detail: 'poorly worded',
        source: { pointer: "data/attributes/phrase" },
        title: 'invalid phrase'
      }
    ]
  });
});

test("with convertErrors set to false, does not convert errors", function(assert) {
  const mock = new MockRequest('user');
  let errors = { errors: { phrase: 'poorly worded' } };
  mock.fails({ response: errors, convertErrors: false });
  assert.deepEqual(mock.errorResponse, errors);
});

test("with errors response that will be converted but does not have errors as object key", function(assert) {
  const mock = new MockRequest('user');
  let errors = { phrase: 'poorly worded' };
  assert.throws(()=> {
    mock.fails({ response: errors, convertErrors: true });
  });
});

moduleFor('serializer:application', 'MockRequest#timeCalled', inlineSetup(serializerType));

test("can verify how many times a queryRecord call was mocked", function(assert) {
  Ember.run(()=> {
    const done = assert.async();
    const mock = mockQueryRecord('company', {}).returns({ json: build('company') });

    FactoryGuy.store.queryRecord('company', {}).then(()=> {
      FactoryGuy.store.queryRecord('company', {}).then(()=> {
        assert.equal(mock.timesCalled, 2);
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
        assert.equal(mock.timesCalled, 2);
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
        assert.equal(mock.timesCalled, 2);
        done();
      });
    });
  });
});

moduleFor('serializer:application', 'MockRequest#basicRequestMatches', inlineSetup(serializerType));

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


moduleFor('serializer:application', 'MockRequest #disable, #enable, and #destroy', inlineSetup(serializerType));

test("can enable, disable, and destroy mock", function(assert) {
  Ember.run(()=> {
    const done = assert.async();
    let json1 = build('user');
    let json2 = build('user');
    let mock1 = mockQueryRecord('user', { id: 1 }).returns({ json: json1 });
    let mock2 = mockQueryRecord('user', {}).returns({ json: json2 });

    notOk(mock1.isDestroyed, "isDestroyed is false initially")

    FactoryGuy.store.queryRecord('user', { id: 1 }).then((data)=> {
      assert.equal(data.get('id'), json1.get('id'), "the first mock works initially");
      mock1.disable();
      FactoryGuy.store.queryRecord('user', { id: 1 }).then((data)=> {
        assert.equal(data.get('id'), json2.get('id'), "the first mock doesn't work once it's disabled");
        mock1.enable();
        FactoryGuy.store.queryRecord('user', { id: 1 }).then((data)=> {
          assert.equal(data.get('id'), json1.get('id'), "the first mock works again after enabling");
          mock1.destroy();
          assert.ok(mock1.isDestroyed, "isDestroyed is set to true once the mock is destroyed")
          FactoryGuy.store.queryRecord('user', { id: 1 }).then((data)=> {
            assert.equal(data.get('id'), json2.get('id'), "the destroyed first mock doesn't work");
            done();
          });
        });
      });
    });
  });
});

moduleFor('serializer:application', 'MockFindRecord', inlineSetup(serializerType));

test("has access to handler being used by mockjax", function(assert) {
  let mock = mockFindRecord('user');
  assert.ok(mock.handler);
});

test("#get method to access payload", function(assert) {
  let mock = mockFindRecord('user');
  assert.equal(mock.get('name'), 'User1');
});

test("#getUrl uses urlForFindRecord if it is set on the adapter", function(assert) {
  let mock1 = mockFindRecord('user');
  assert.equal(mock1.getUrl(), '/users/1');

  let adapter = FactoryGuy.store.adapterFor('user');
  sinon.stub(adapter, 'urlForFindRecord').returns('/dude/1');

  assert.equal(mock1.getUrl(), '/dude/1');
  adapter.urlForFindRecord.restore();
});


moduleFor('serializer:application', 'MockFindRecord #getUrl', inlineSetup(serializerType));

test("with proxy", function(assert) {
  const json = build('user');
  const mock = mockFindRecord('user').returns({ json });
  assert.equal(mock.getUrl(), '/users/1');
});

test("with json", function(assert) {
  const json = { id: 1, name: "Dan" };
  const mock = mockFindRecord('user').returns({ json });
  assert.equal(mock.getUrl(), '/users/1');
});


moduleFor('serializer:application', 'MockFindRecord #fails', inlineSetup(serializerType));

test("with errors in response", function(assert) {
  Ember.run(()=> {
    const done = assert.async();

    const response = { errors: { description: ['bad'] } };
    const mock = mockFindRecord('profile').fails({ response });

    FactoryGuy.store.findRecord('profile', 1)
      .catch((res)=> {
        assert.equal(mock.timesCalled, 1);
        assert.ok(true);
        done();
      });
  });
});


moduleFor('serializer:application', 'MockFindAll', inlineSetup(serializerType));

test("have access to handler being used by mockjax", function(assert) {
  let mock = mockFindAll('user');
  assert.ok(mock.handler);
});

test("#get method to access payload", function(assert) {
  let mock = mockFindAll('user', 2);
  assert.deepEqual(mock.get(0), { id: 1, name: 'User1', style: 'normal' });
});

test("#getUrl uses urlForFindAll if it is set on the adapter", function(assert) {
  let mock1 = mockFindAll('user');
  assert.equal(mock1.getUrl(), '/users');

  let adapter = FactoryGuy.store.adapterFor('user');
  sinon.stub(adapter, 'urlForFindAll').returns('/zombies');

  assert.equal(mock1.getUrl(), '/zombies');
  adapter.urlForFindAll.restore();
});


moduleFor('serializer:application', 'MockQuery', inlineSetup(serializerType));

test("#get method to access payload", function(assert) {
  let json = buildList('user', 2)
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

test("have access to handler being used by mockjax", function(assert) {
  let mock = mockQuery('user');
  assert.ok(mock.handler);
});

test("#getUrl uses urlForQuery if it is set on the adapter", function(assert) {
  let mock1 = mockQuery('user');
  assert.equal(mock1.getUrl(), '/users');

  let adapter = FactoryGuy.store.adapterFor('user');
  sinon.stub(adapter, 'urlForQuery').returns('/dudes');

  assert.equal(mock1.getUrl(), '/dudes');
  adapter.urlForQuery.restore();
});

moduleFor('serializer:application', 'mockQueryRecord', inlineSetup(serializerType));

test("#get method to access payload", function(assert) {
  let json = build('user')
  let mock = mockQueryRecord('user', {}).returns({ json });
  assert.deepEqual(mock.get(), json.get());
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

test("have access to handler being used by mockjax", function(assert) {
  let mock = mockQueryRecord('user');
  assert.ok(mock.handler);
});

test("using fails makes the request fail", function(assert) {
  Ember.run(()=> {
    let done = assert.async();

    mockQueryRecord('user').fails();
    FactoryGuy.store.queryRecord('user', {})
      .catch(()=> {
        assert.ok(true);
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

test("#getUrl uses urlForQueryRecord if it is set on the adapter", function(assert) {
  let mock1 = mockQueryRecord('user', {zip: 'it'});
  assert.equal(mock1.getUrl(), '/users');

  let adapter = FactoryGuy.store.adapterFor('user');
  sinon.stub(adapter, 'urlForQueryRecord').returns('/dudes');

  assert.equal(mock1.getUrl(), '/dudes');
  adapter.urlForQueryRecord.restore();
});

moduleFor('serializer:application', 'MockUpdate', inlineSetup(serializerType));

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

test("#getUrl uses urlForUpdateRecord if it is set on the adapter", function(assert) {
  let mock1 = mockUpdate('user', '1');
  assert.equal(mock1.getUrl(), '/users/1');

  let adapter = FactoryGuy.store.adapterFor('user');
  sinon.stub(adapter, 'urlForUpdateRecord').returns('/dudes/1');

  assert.equal(mock1.getUrl(), '/dudes/1');
  adapter.urlForUpdateRecord.restore();
});

moduleFor('serializer:application', 'MockCreate', inlineSetup(serializerType));

test("with incorrect parameters", function(assert) {

  assert.throws(function() {
    mockCreate();
  }, "missing modelName");

});

test("#getUrl uses urlForCreateRecord if it is set on the adapter", function(assert) {
  let mock1 = mockCreate('user');
  assert.equal(mock1.getUrl(), '/users');

  let adapter = FactoryGuy.store.adapterFor('user');
  sinon.stub(adapter, 'urlForCreateRecord').returns('/makeMeAZombie');

  assert.equal(mock1.getUrl(), '/makeMeAZombie');
  adapter.urlForCreateRecord.restore();
});

moduleFor('serializer:application', 'MockDelete', inlineSetup(serializerType));

test("with incorrect parameters", function(assert) {

  assert.throws(function() {
    mockDelete();
  }, "missing modelName");

});

test("#getUrl uses urlForDeleteRecord if it is set on the adapter", function(assert) {
  let mock1 = mockDelete('user', '2');
  assert.equal(mock1.getUrl(), '/users/2');

  let adapter = FactoryGuy.store.adapterFor('user');
  sinon.stub(adapter, 'urlForDeleteRecord').returns('/deleteMyZombie/2');

  assert.equal(mock1.getUrl(), '/deleteMyZombie/2');
  adapter.urlForDeleteRecord.restore();
});
