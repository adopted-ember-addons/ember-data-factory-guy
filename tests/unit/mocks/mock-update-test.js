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

test("mock has mockId when using id", function(assert) {
  let mock = mockUpdate('user', 1);
  assert.deepEqual(mock.mockId, {type: 'PATCH', url: '/users/1', num: 0});
});

test("mock has mockId when not using id", function(assert) {
  let mock = mockUpdate('user');
  assert.deepEqual(mock.mockId, {type: 'PATCH', url: '/users/:id', num: 0});
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
