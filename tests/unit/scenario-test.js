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
} from '@eflexsystems/ember-data-factory-guy';

module('scenario', function () {
  test('proxies all build/make methods', function (assert) {
    let scenario = new Scenario();
    assert.strictEqual(scenario.make, make);
    assert.strictEqual(scenario.makeNew, makeNew);
    assert.strictEqual(scenario.makeList, makeList);
    assert.strictEqual(scenario.build, build);
    assert.strictEqual(scenario.buildList, buildList);
  });

  test('proxies all mock request methods', function (assert) {
    let scenario = new Scenario();
    assert.strictEqual(scenario.mockFindRecord, mockFindRecord);
    assert.strictEqual(scenario.mockFindAll, mockFindAll);
    assert.strictEqual(scenario.mockReload, mockReload);
    assert.strictEqual(scenario.mockQuery, mockQuery);
    assert.strictEqual(scenario.mockQueryRecord, mockQueryRecord);
    assert.strictEqual(scenario.mockCreate, mockCreate);
    assert.strictEqual(scenario.mockUpdate, mockUpdate);
    assert.strictEqual(scenario.mockDelete, mockDelete);
    assert.strictEqual(scenario.mock, mock);
    assert.strictEqual(scenario.attributesFor, attributesFor);
  });
});
