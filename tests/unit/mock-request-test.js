import Ember from 'ember';
import FactoryGuy, { make, build, mockFindAll, mockFind, mockQueryRecord, mockUpdate } from 'ember-data-factory-guy';
import { inlineSetup } from '../helpers/utility-methods';

let App = null;
let serializerType = '-json-api';

module('mockFind#getUrl', inlineSetup(App));

test("with proxy", function() {
  let json = build('user');
  let mock = mockFind('user').returns({ json });
  equal(mock.getUrl(), '/users/1');
});

test("with json", function() {
  let json = { id: 1, name: "Dan" };
  let mock = mockFind('user').returns({ json });
  equal(mock.getUrl(), '/users/1');
});


module('MockRequest#timeCalled', inlineSetup(App, serializerType));

test("can verify how many times a queryRecord call was mocked", function(assert) {
  Ember.run(()=> {
    var done = assert.async();
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
    var done = assert.async();
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
    var done = assert.async();
    let company = make('company');
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