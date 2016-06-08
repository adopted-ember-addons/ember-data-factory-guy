import Ember from 'ember';
import FactoryGuy, {make, build, mockFindAll, mockFind, mockQueryRecord, mockUpdate} from 'ember-data-factory-guy';
import {inlineSetup} from '../helpers/utility-methods';
import MockRequest from 'ember-data-factory-guy/mocks/mock-request';

let App = null;
let serializerType = '-json-api';

module('mockFind #getUrl', inlineSetup(App));

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


module('mockFind #fails', inlineSetup(App));

test("with errors in response", function(assert) {
  Ember.run(()=> {
    let done = assert.async();

    let response = { errors: { description: ['bad'] } };
    let mock = mockFind('profile', 1).fails({ response });

    FactoryGuy.store.findRecord('profile', 1)
      .catch((res)=> {
        //let errors = profile.get('errors.messages')[0];
        //console.log('AA',invalidError.errors);
        //console.log('BB',profile.get('errors.messages'));
        //console.log(profile.get('errors'))
        //equal(errors.title, 'invalid description');
        //equal(errors.detail, 'bad');
        equal(mock.timesCalled, 1);
        ok(true);
        done();
      });
  });
});

module('MockRequest #fails', inlineSetup(App));

test("status must be 3XX, 4XX or 5XX", function(assert) {
  let mock = new MockRequest('user');
  
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