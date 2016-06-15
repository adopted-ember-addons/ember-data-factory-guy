import Ember from 'ember';
import FactoryGuy, {make, build, mockFindAll, mockFind, mockQuery, mockQueryRecord, mockUpdate} from 'ember-data-factory-guy';
import {inlineSetup} from '../helpers/utility-methods';
import MockRequest from 'ember-data-factory-guy/mocks/mock-request';

let App = null;
const serializerType = '-json-api';

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

  assert.ok(! mock.basicRequestMatches(settings));
});

test("fails if the URLs don't match", function(assert) {
  const mock = new MockRequest('user');
  const getType = sinon.stub(mock, 'getType').returns('GET');
  const getUrl = sinon.stub(mock, 'getUrl').returns('/api/ember-data-factory-guy');

  const settings = {
    type: 'GET',
    url: '/api/ember-data-factory-guy/123'
  };

  assert.ok(! mock.basicRequestMatches(settings));
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
