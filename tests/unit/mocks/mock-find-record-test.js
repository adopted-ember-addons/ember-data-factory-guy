import Ember from 'ember';
import { moduleFor, test } from 'ember-qunit';
import FactoryGuy, { build, mockFindRecord } from 'ember-data-factory-guy';
import { inlineSetup } from '../../helpers/utility-methods';
import sinon from 'sinon';

const serializerType = '-json-api';

moduleFor('serializer:application', 'MockFindRecord', inlineSetup(serializerType));

test("mock has mockId", async function(assert) {
  let mock = mockFindRecord('user');

  await Ember.run(async () => FactoryGuy.store.find('user', mock.get('id')));

  assert.deepEqual(mock.mockId, {type: 'GET', url: '/users/1', num: 0});
});

test("#get method to access payload", function(assert) {
  let mock = mockFindRecord('user');
  assert.equal(mock.get('name'), 'User1');
});

test("logging response", async function(assert) {
  FactoryGuy.settings({logLevel: 1});

  const consoleStub = sinon.spy(console, 'log'),
        mock        = mockFindRecord('profile');

  await Ember.run(async () => FactoryGuy.store.findRecord('profile', 1));

  let response     = JSON.parse(mock.actualResponseJson()),
      expectedArgs = [
        "[factory-guy]",
        "MockFindRecord",
        "GET",
        "[200]",
        "/profiles/1",
        response
      ];

  assert.deepEqual(consoleStub.getCall(0).args, expectedArgs, 'without query params');

  const queryParams = {include: 'company'};
  mock.withParams(queryParams);

  await Ember.run(async () => FactoryGuy.store.findRecord('profile', 1, queryParams));

  expectedArgs[4] = `/profiles/1?${Ember.$.param(queryParams)}`;
  assert.deepEqual(consoleStub.getCall(1).args, expectedArgs, 'with query params');

  console.log.restore();
});

moduleFor('serializer:application', 'MockFindRecord #getUrl', inlineSetup(serializerType));

test("with json proxy", function(assert) {
  const json = build('user'),
        mock = mockFindRecord('user').returns({json});

  assert.equal(mock.getUrl(), '/users/1');
});

test("with json", function(assert) {
  const json = {data: {id: 1, name: "Dan"}},
        mock = mockFindRecord('user').returns({json});

  assert.equal(mock.getUrl(), '/users/1');
});

test("uses urlForFindRecord if it is set on the adapter", function(assert) {
  let mock = mockFindRecord('user');
  assert.equal(mock.getUrl(), '/users/1', 'default ember-data findRecord url');

  let adapter = FactoryGuy.store.adapterFor('user');
  let findRecordStub = sinon.stub(adapter, 'urlForFindRecord').returns('/dude/1');

  assert.equal(mock.getUrl(), '/dude/1', 'factory guy uses urlForFindRecord from adapter');
  assert.ok(findRecordStub.calledOnce);
  assert.ok(findRecordStub.calledWith(1, 'user'), 'correct parameters passed to urlForFindRecord');

  adapter.urlForFindRecord.restore();
});

test("passes adapterOptions to urlForFindRecord", function(assert) {
  let adapterOptions = {e: 1},
      mock           = mockFindRecord('user').withAdapterOptions(adapterOptions),
      adapter        = FactoryGuy.store.adapterFor('user'),
      findRecordStub = sinon.stub(adapter, 'urlForFindRecord');

  mock.getUrl();

  let [, , snapshot] = findRecordStub.getCall(0).args;
  assert.deepEqual(snapshot.adapterOptions, adapterOptions, 'adapterOptions passed to urlForFindRecord');

  adapter.urlForFindRecord.restore();
});

moduleFor('serializer:application', 'MockFindRecord #fails', inlineSetup(serializerType));

test("with errors in response", function(assert) {
  Ember.run(() => {
    const done     = assert.async(),
          response = {errors: {description: ['bad']}},
          mock     = mockFindRecord('profile').fails({response});

    FactoryGuy.store.findRecord('profile', 1)
      .catch(() => {
        assert.equal(mock.timesCalled, 1);
        assert.ok(true);
        done();
      });
  });
});

