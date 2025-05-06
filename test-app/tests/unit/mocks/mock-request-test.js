import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import FactoryGuy, {
  build,
  make,
  mockFindAll,
  mockQueryRecord,
  mockUpdate,
} from 'ember-data-factory-guy';
import { inlineSetup } from '../../helpers/utility-methods';
import { MockStoreRequest } from 'ember-data-factory-guy/-private';
import sinon from 'sinon';

const serializerType = '-json-api';

module('MockRequest', function (hooks) {
  setupTest(hooks);
  inlineSetup(hooks, serializerType);

  module('#fails', function () {
    test('status must be 3XX, 4XX or 5XX', function (assert) {
      const mock = new MockStoreRequest('user');

      assert.throws(() => mock.fails({ status: 201 }));
      assert.throws(() => mock.fails({ status: 292 }));
      assert.throws(() => mock.fails({ status: 104 }));

      assert.ok(mock.fails({ status: 300 }) instanceof MockStoreRequest);
      assert.ok(mock.fails({ status: 303 }) instanceof MockStoreRequest);
      assert.ok(mock.fails({ status: 401 }) instanceof MockStoreRequest);
      assert.ok(mock.fails({ status: 521 }) instanceof MockStoreRequest);
    });

    test('with convertErrors not set, the errors are converted to JSONAPI formatted errors', function (assert) {
      const mock = new MockStoreRequest('user');
      let errors = { errors: { phrase: 'poorly worded' } };

      mock.fails({ response: errors });
      assert.deepEqual(mock.errorResponse, {
        errors: [
          {
            detail: 'poorly worded',
            source: { pointer: 'data/attributes/phrase' },
            title: 'invalid phrase',
          },
        ],
      });
    });

    test('with convertErrors set to false, does not convert errors', function (assert) {
      const mock = new MockStoreRequest('user');
      let errors = { errors: { phrase: 'poorly worded' } };

      mock.fails({ response: errors, convertErrors: false });
      assert.deepEqual(mock.errorResponse, errors);
    });

    test('with errors response that will be converted but does not have errors as object key', function (assert) {
      const mock = new MockStoreRequest('user');
      let errors = { phrase: 'poorly worded' };

      assert.throws(() =>
        mock.fails({ response: errors, convertErrors: true })
      );
    });
  });

  module('#timeCalled', function () {
    test('can verify how many times a queryRecord call was mocked', async function (assert) {
      const mock = mockQueryRecord('company', {}).returns({
        json: build('company'),
      });

      await FactoryGuy.store.queryRecord('company', {});
      await FactoryGuy.store.queryRecord('company', {});
      assert.equal(mock.timesCalled, 2);
    });

    test('can verify how many times a findAll call was mocked', async function (assert) {
      const mock = mockFindAll('company');

      await FactoryGuy.store.findAll('company');
      await FactoryGuy.store.findAll('company');
      assert.equal(mock.timesCalled, 2);
    });

    test('can verify how many times an update call was mocked', async function (assert) {
      const company = make('company'),
        mock = mockUpdate(company);

      company.set('name', 'ONE');
      await company.save();

      company.set('name', 'TWO');
      await company.save();

      assert.equal(mock.timesCalled, 2);
    });
  });

  test('using returns with headers adds the headers to the response', async function (assert) {
    const queryParams = { name: 'MyCompany' };
    const handler = mockQueryRecord('company', queryParams);

    handler.returns({ headers: { 'X-Testing': 'absolutely' } });

    let { headers } = handler.getResponse();
    assert.deepEqual(headers, { 'X-Testing': 'absolutely' });

    sinon.spy(window, 'fetch');

    await FactoryGuy.store.queryRecord('company', queryParams);

    const response = await window.fetch.getCall(0).returnValue;
    assert.equal(response.headers.get('X-Testing'), 'absolutely');

    window.fetch.restore();
  });

  module('#disable, #enable, and #destroy', function () {
    test('can enable, disable, and destroy mock', async function (assert) {
      let json1 = build('user'),
        json2 = build('user'),
        mock1 = mockQueryRecord('user', { id: 1 }).returns({ json: json1 });

      mockQueryRecord('user', {}).returns({ json: json2 });

      assert.notOk(mock1.isDestroyed, 'isDestroyed is false initially');

      let data = await FactoryGuy.store.queryRecord('user', { id: 1 });
      assert.equal(
        data.get('id'),
        json1.get('id'),
        'the first mock works initially'
      );

      mock1.disable();
      data = await FactoryGuy.store.queryRecord('user', { id: 1 });
      assert.equal(
        data.get('id'),
        json2.get('id'),
        "the first mock doesn't work once it's disabled"
      );

      mock1.enable();
      data = await FactoryGuy.store.queryRecord('user', { id: 1 });
      assert.equal(
        data.get('id'),
        json1.get('id'),
        'the first mock works again after enabling'
      );

      mock1.destroy();
      assert.ok(
        mock1.isDestroyed,
        'isDestroyed is set to true once the mock is destroyed'
      );
      data = await FactoryGuy.store.queryRecord('user', { id: 1 });
      assert.equal(
        data.get('id'),
        json2.get('id'),
        "the destroyed first mock doesn't work"
      );
    });
  });

  module('#makeFakeSnapshot', function () {
    test('with model set on request', async function (assert) {
      const model = FactoryGuy.make('user');
      const mock = new MockStoreRequest('user', 'findRecord');
      mock.model = model;

      const snapshot = mock.makeFakeSnapshot();

      assert.deepEqual(snapshot, { adapterOptions: undefined, record: model });
    });

    test('without mocked model in the store', async function (assert) {
      const json = FactoryGuy.build('user');
      const mock = new MockStoreRequest('user', 'findRecord');
      mock.returns({ json });

      const snapshot = mock.makeFakeSnapshot();

      assert.deepEqual(snapshot, {
        adapterOptions: undefined,
        record: undefined,
      });
    });

    test('with mocked model in the store', async function (assert) {
      const model = FactoryGuy.make('user');
      const mock = new MockStoreRequest('user', 'findRecord');
      mock.returns({ model });
      mock.id = model.id;

      const snapshot = mock.makeFakeSnapshot();

      assert.deepEqual(snapshot, { adapterOptions: undefined, record: model });
    });

    test('without id', async function (assert) {
      const model = FactoryGuy.make('user');
      const mock = new MockStoreRequest('user', 'findRecord');
      mock.returns({ model });

      const snapshot = mock.makeFakeSnapshot();

      assert.deepEqual(snapshot, {
        adapterOptions: undefined,
        record: undefined,
      });
    });
  });
});
