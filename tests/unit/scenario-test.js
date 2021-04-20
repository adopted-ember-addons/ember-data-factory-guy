import { module, test } from 'qunit';

import {
  attributesFor,
  build,
  buildList,
  make,
  makeList,
  makeNew,
  mock,
  mockCreate,
  mockDelete,
  mockFindAll,
  mockFindRecord,
  mockQuery,
  mockQueryRecord,
  mockReload,
  mockUpdate,
  Scenario,
} from 'ember-data-factory-guy';

module('scenario', function () {
  test('proxies all build/make methods', function (assert) {
    let scenario = new Scenario();
    assert.equal(scenario.make, make);
    assert.equal(scenario.makeNew, makeNew);
    assert.equal(scenario.makeList, makeList);
    assert.equal(scenario.build, build);
    assert.equal(scenario.buildList, buildList);
  });

  test('proxies all mock request methods', function (assert) {
    let scenario = new Scenario();
    assert.equal(scenario.mockFindRecord, mockFindRecord);
    assert.equal(scenario.mockFindAll, mockFindAll);
    assert.equal(scenario.mockReload, mockReload);
    assert.equal(scenario.mockQuery, mockQuery);
    assert.equal(scenario.mockQueryRecord, mockQueryRecord);
    assert.equal(scenario.mockCreate, mockCreate);
    assert.equal(scenario.mockUpdate, mockUpdate);
    assert.equal(scenario.mockDelete, mockDelete);
    assert.equal(scenario.mock, mock);
    assert.equal(scenario.attributesFor, attributesFor);
  });
});
