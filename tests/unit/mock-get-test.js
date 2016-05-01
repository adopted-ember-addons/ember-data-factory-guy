import Ember from 'ember';
import FactoryGuy, { build, mockFindAll, mockQueryRecord } from 'ember-data-factory-guy';
import moduleForAcceptance from '../helpers/module-for-acceptance';

moduleForAcceptance('MockGetRequest#timeCalled');

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