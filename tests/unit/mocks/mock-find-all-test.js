import {moduleFor, test} from 'ember-qunit';
import FactoryGuy, {mockFindAll, mockQuery} from 'ember-data-factory-guy';
import {inlineSetup} from '../../helpers/utility-methods';
import sinon from 'sinon';
import RequestManager from 'ember-data-factory-guy/mocks/request-manager';

const serializerType = '-json-api';

moduleFor('serializer:application', 'MockFindAll', inlineSetup(serializerType));

test("mock has mockId", function(assert) {
  let mock = mockFindAll('user');
  assert.deepEqual(mock.mockId, { type: 'GET', url: '/users', num: 0 });
});

test("#get method to access payload", function(assert) {
  let mock = mockFindAll('user', 2);
  assert.deepEqual(mock.get(0), { id: 1, name: 'User1', style: 'normal' });
});

test("RequestManager creates wrapper with one mockFindAll mock", function(assert) {
  let mock = mockFindAll('user', 2);
  let wrapper = RequestManager.findWrapper({ handler: mock });
  let ids = wrapper.getHandlers().map(h => h.mockId);
  assert.deepEqual(ids, [{ type: 'GET', url: '/users', num: 0 }]);
});

test("RequestManager creates wrapper with two mockFindAll mocks", function(assert) {
  mockFindAll('user', 2),
  mockFindAll('user', 1);

  let wrapper = RequestManager.findWrapper({ type: 'GET', url: '/users' });
  let ids = wrapper.getHandlers().map(h => h.mockId);
  assert.deepEqual(ids, [{ type: 'GET', url: '/users', num: 0 }, { type: 'GET', url: '/users', num: 1 }]);
});

test("mockFindAll (when declared FIRST ) won't be used if mockQuery is present with query ", async function(assert) {
  let mockF = mockFindAll('user', 2);
  let mockQ = mockQuery('user', { name: 'Sleepy' });

  await FactoryGuy.store.query('user', {});

  assert.equal(mockF.timesCalled, 1, 'mockFindAll used since no query params exist');
  assert.equal(mockQ.timesCalled, 0, 'mockQuery not used');

  await FactoryGuy.store.query('user', { name: 'Sleepy' });
  assert.equal(mockF.timesCalled, 1, 'mockFindAll not used since query params exist');
  assert.equal(mockQ.timesCalled, 1, 'now mockQuery is used');
});

moduleFor('serializer:application', 'MockFindAll #getUrl', inlineSetup(serializerType));

test("uses urlForFindAll if it is set on the adapter", function(assert) {
  let mock = mockFindAll('user');
  assert.equal(mock.getUrl(), '/users', 'default ember-data findRecord url');

  let adapter = FactoryGuy.store.adapterFor('user');
  let findAllStub = sinon.stub(adapter, 'urlForFindAll').returns('/zombies');

  assert.equal(mock.getUrl(), '/zombies', 'factory guy uses urlForFindRecord from adapter');
  assert.ok(findAllStub.calledOnce);
  assert.ok(findAllStub.calledWith('user'), 'correct parameters passed to urlForFindAll');

  adapter.urlForFindAll.restore();
});

test("#getUrl passes adapterOptions to urlForFindAll", function(assert) {
  let options = { e: 1 };
  let mock = mockFindAll('user').adapterOptions(options);

  let adapter = FactoryGuy.store.adapterFor('user');
  let findRecordStub = sinon.stub(adapter, 'urlForFindAll');

  mock.getUrl();
  assert.ok(findRecordStub.calledOnce);
  assert.ok(findRecordStub.calledWith('user', { adapterOptions: options }), 'adapterOptions passed to urlForFindAll');

  adapter.urlForFindAll.restore();
});
