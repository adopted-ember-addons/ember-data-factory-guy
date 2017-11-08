import Ember from 'ember';
import { moduleFor, test } from 'ember-qunit';
import FactoryGuy, { make, mockUpdate } from 'ember-data-factory-guy';
import { inlineSetup } from '../../helpers/utility-methods';
import sinon from 'sinon';

const serializerType = '-json-api';


moduleFor('serializer:application', 'MockUpdate', inlineSetup(serializerType));

test("with incorrect parameters", function(assert) {

  assert.throws(function() {
    mockUpdate();
  }, "missing everything");

});

test("logging response", async function(assert) {
  FactoryGuy.settings({logLevel: 1});

  const consoleStub = sinon.spy(console, 'log'),
        profile     = make('profile'),
        mock        = mockUpdate(profile);

  await Ember.run(async () => profile.save());

  let response     = JSON.parse(mock.getResponse().responseText),
      expectedArgs = [
        "[factory-guy]",
        "MockUpdate",
        "PATCH",
        "[200]",
        `/profiles/1`,
        response
      ];

  assert.deepEqual(consoleStub.getCall(0).args, expectedArgs);

  console.log.restore();
});

test("makeSnapshot when modelName, id available", function(assert) {
  let mock = mockUpdate('user', 1);
  assert.deepEqual(mock.mockId, {type: 'PATCH', url: '/users/1', num: 0});
});

test("makeSnapshot", function(assert) {
  let user = make('user');

  let tests = [
    [[user], user, 'with model as arguments'],
    [['user', user.id], user, 'with modelName, id as arguments'],
    [['user'], undefined, 'with only modelName as arguments']
  ];

  for (let test of tests) {
    let [args, expectedRecord, message] = test;
    let mock     = mockUpdate(...args),
        snapshot = mock.makeFakeSnapshot(),
        {record} = snapshot;
    assert.deepEqual(record, expectedRecord, message);
  }
});

test("mockId", function(assert) {
  let mock = mockUpdate('user', 1);
  assert.deepEqual(mock.mockId, {type: 'PATCH', url: '/users/1', num: 0});
});

test("getUrl", function(assert) {
  let user = make('user');

  let tests = [
    [[user], `/users/${user.id}`, "url when using model"],
    [['user', user.id], `/users/${user.id}`, "url when using modelName, id"],
    [['user'], `/users/:id`, "url when not using id"]
  ];

  for (let test of tests) {
    let [args, expectedUrl, message] = test;
    let mock = mockUpdate(...args),
        url  = mock.getUrl();

    assert.equal(url, expectedUrl, message);
  }
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
