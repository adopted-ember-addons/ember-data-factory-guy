import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { run } from '@ember/runloop';
import { param } from 'ember-data-factory-guy/utils/helper-functions';
import FactoryGuy, {
  make,
  buildList,
  mockFindAll,
  mockQuery
} from 'ember-data-factory-guy';
import { inlineSetup } from '../../helpers/utility-methods';
import sinon from 'sinon';
import RequestManager from 'ember-data-factory-guy/mocks/request-manager';

const serializerType = '-json-api';

module('MockFindAll', function(hooks) {
  setupTest(hooks);
  inlineSetup(hooks, serializerType);

  test("mockId", function(assert) {
    let mock = mockFindAll('user');
    assert.deepEqual(mock.mockId, {type: 'GET', url: '/users', num: 0});
  });

  test("mockFindAll returns() accepts only ids, or models or json keys", function(assert) {
    const cat     = make('cat'),
          handler = mockFindAll('cat');

    handler.returns({ids: [cat.id]});
    handler.returns({models: [cat]});
    handler.returns({json: buildList('cat')});

    // values don't matter here
    assert.throws(() => handler.returns({id: undefined}));
    assert.throws(() => handler.returns({model: undefined}));
    assert.throws(() => handler.returns({ids: undefined, json: undefined}));
  });

  test("logging response", async function(assert) {
    FactoryGuy.settings({logLevel: 1});

    const consoleStub = sinon.spy(console, 'log'),
          mock        = mockFindAll('profile');

    await run(async () => FactoryGuy.store.findAll('profile'));

    let response     = JSON.parse(mock.actualResponseJson()),
        expectedArgs = [
          "[factory-guy]",
          "MockFindAll",
          "GET",
          "[200]",
          "/profiles",
          response
        ];

    assert.deepEqual(consoleStub.getCall(0).args, expectedArgs, 'without query params');

    const queryParams = {include: 'company'};
    mock.withParams(queryParams);
    await run(async () => FactoryGuy.store.findAll('profile', queryParams));
    expectedArgs[4] = `/profiles?${param(queryParams)}`;

    assert.deepEqual(consoleStub.getCall(1).args, expectedArgs, 'with query params');

    console.log.restore();
  });

  // fixes bug for issue #318
  test('returns({models}) for non polymorphic type does does not alter type attribute', async function(assert) {
    let cat = make('cat', {type: 'Cuddly'});
    mockFindAll('cat').returns({models: [cat]});
    await FactoryGuy.store.findAll('cat');
    assert.equal(cat.get('type'), 'Cuddly');
  });

  test('returns({models}) for polymorphic type does does not alter type attribute', async function(assert) {
    let hat = make('big-hat');
    mockFindAll('big-hat').returns({models: [hat]});
    await FactoryGuy.store.findAll('big-hat');
    assert.equal(hat.get('type'), 'BigHat'); // default type value
  });

  test("#get method to access payload", function(assert) {
    let mock = mockFindAll('user', 2);
    assert.deepEqual(mock.get(0), {id: 1, name: 'User1', style: 'normal'});
  });

  test("RequestManager creates wrapper with one mockFindAll mock", function(assert) {
    let mock = mockFindAll('user', 2);
    let wrapper = RequestManager.findWrapper({handler: mock});
    let ids = wrapper.getHandlers().map(h => h.mockId);
    assert.deepEqual(ids, [{type: 'GET', url: '/users', num: 0}]);
  });

  test("RequestManager creates wrapper with two mockFindAll mocks", function(assert) {
    mockFindAll('user', 2),
      mockFindAll('user', 1);

    let wrapper = RequestManager.findWrapper({type: 'GET', url: '/users'});
    let ids = wrapper.getHandlers().map(h => h.mockId);
    assert.deepEqual(ids, [{type: 'GET', url: '/users', num: 0}, {type: 'GET', url: '/users', num: 1}]);
  });

  test("mockFindAll (when declared FIRST) won't be used if mockQuery is present with query ", async function(assert) {
    let mockF = mockFindAll('user', 2);
    let mockQ = mockQuery('user', {name: 'Sleepy'});

    await FactoryGuy.store.query('user', {});

    assert.equal(mockF.timesCalled, 1, 'mockFindAll used since no query params exist');
    assert.equal(mockQ.timesCalled, 0, 'mockQuery not used');

    await FactoryGuy.store.query('user', {name: 'Sleepy'});
    assert.equal(mockF.timesCalled, 1, 'mockFindAll not used since query params exist');
    assert.equal(mockQ.timesCalled, 1, 'now mockQuery is used');
  });

  test("mockFindAll with query params", async function(assert) {
    let mockF = mockFindAll('user', 1);
    let mockFQ = mockFindAll('user', 2).withParams({food: 'shrimp'});
    let mockQ = mockQuery('user', {name: 'Sleepy'});

    await FactoryGuy.store.query('user', {});
    assert.equal(mockF.timesCalled, 1, 'mockFindAll with no query params used');

    await FactoryGuy.store.query('user', {food: 'shrimp'});
    assert.equal(mockFQ.timesCalled, 1, 'mockFindAll with query params used');

    await FactoryGuy.store.query('user', {name: 'Sleepy'});
    assert.equal(mockQ.timesCalled, 1, 'mockQuery is used');
  });

  test("#withParams", async function(assert) {
    let mockFQ = mockFindAll('user', 2).withParams({rightParams: true});

    await FactoryGuy.store.query('user', { rightParams: false });
  });

  module('#getUrl', function() {

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

    test("passes adapterOptions to urlForFindAll", function(assert) {
      let options        = {e: 1},
          adapter        = FactoryGuy.store.adapterFor('user'),
          mock           = mockFindAll('user').withAdapterOptions(options),
          findRecordStub = sinon.stub(adapter, 'urlForFindAll');

      mock.getUrl();

      assert.ok(findRecordStub.calledOnce);
      assert.ok(findRecordStub.calledWith('user', {adapterOptions: options, record: undefined}), 'adapterOptions passed to urlForFindAll');

      adapter.urlForFindAll.restore();
    });
  });
});
