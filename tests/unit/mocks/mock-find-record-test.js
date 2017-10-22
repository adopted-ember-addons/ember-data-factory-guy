import Ember from 'ember';
import {moduleFor, test} from 'ember-qunit';
import FactoryGuy, {build,mockFindRecord} from 'ember-data-factory-guy';
import {inlineSetup} from '../../helpers/utility-methods';
import sinon from 'sinon';

const serializerType = '-json-api';

moduleFor('serializer:application', 'MockFindRecord', inlineSetup(serializerType));

test("mock has mockId", function(assert) {
  let mock = mockFindRecord('user');
  assert.deepEqual(mock.mockId, { type: 'GET', url: '/users/1', num: 0 });
});

test("#get method to access payload", function(assert) {
  let mock = mockFindRecord('user');
  assert.equal(mock.get('name'), 'User1');
});

moduleFor('serializer:application', 'MockFindRecord #getUrl', inlineSetup(serializerType));

test("with proxy", function(assert) {
  const json = build('user');
  const mock = mockFindRecord('user').returns({ json });
  assert.equal(mock.getUrl(), '/users/1');
});

test("with json", function(assert) {
  const json = { data: { id: 1, name: "Dan" } };
  const mock = mockFindRecord('user').returns({ json });
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
  let options = { e: 1 };
  let mock = mockFindRecord('user').adapterOptions(options);

  let adapter = FactoryGuy.store.adapterFor('user');
  let findRecordStub = sinon.stub(adapter, 'urlForFindRecord');

  mock.getUrl();
  assert.ok(findRecordStub.calledOnce);
  assert.ok(findRecordStub.calledWith(1, 'user', { adapterOptions: options }), 'adapterOptions passed to urlForFindRecord');

  adapter.urlForFindRecord.restore();
});

moduleFor('serializer:application', 'MockFindRecord #fails', inlineSetup(serializerType));

test("with errors in response", function(assert) {
  Ember.run(() => {
    const done = assert.async();

    const response = { errors: { description: ['bad'] } };
    const mock = mockFindRecord('profile').fails({ response });

    FactoryGuy.store.findRecord('profile', 1)
      .catch(() => {
        assert.equal(mock.timesCalled, 1);
        assert.ok(true);
        done();
      });
  });
});

