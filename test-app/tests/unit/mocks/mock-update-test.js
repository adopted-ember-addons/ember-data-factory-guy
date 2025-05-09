import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import FactoryGuy, { make, mockUpdate } from 'ember-data-factory-guy';
import { inlineSetup } from '../../helpers/utility-methods';
import sinon from 'sinon';

const serializerType = '-json-api';

module('MockUpdate', function (hooks) {
  setupTest(hooks);
  inlineSetup(hooks, serializerType);

  test('with incorrect parameters', function (assert) {
    assert.throws(function () {
      mockUpdate();
    }, 'missing everything');
  });

  test('using returns when only setting modelName', function (assert) {
    assert.throws(function () {
      mockUpdate('profile').returns({});
    }, "can't user returns when only specifying modelName");
  });

  test('mockId', function (assert) {
    let mock = mockUpdate('user', 1);
    assert.deepEqual(mock.mockId, { type: 'PATCH', url: '/users/1', num: 0 });
  });

  test('logging response', async function (assert) {
    FactoryGuy.settings({ logLevel: 1 });

    const consoleStub = sinon.spy(console, 'log'),
      profile = make('profile'),
      mock = mockUpdate(profile);

    await profile.save();

    let response = JSON.parse(mock.getResponse().responseText),
      expectedArgs = [
        '[factory-guy]',
        'MockUpdate',
        'PATCH',
        '[200]',
        `/profiles/1`,
        response,
      ];

    assert.deepEqual(consoleStub.getCall(0).args, expectedArgs);
  });

  test('#makeFakeSnapshot', function (assert) {
    assert.expect(3);
    let user = make('user');

    let tests = [
      [[user], user, 'has record when model in arguments'],
      [['user', user.id], user, 'has record when modelName, id in arguments'],
      [
        ['user'],
        undefined,
        'does not have record when only modelName in arguments',
      ],
    ];

    for (let test of tests) {
      let [args, expectedRecord, message] = test;
      let mock = mockUpdate(...args),
        snapshot = mock.makeFakeSnapshot(),
        { record } = snapshot;
      assert.deepEqual(record, expectedRecord, message);
    }
  });

  test('#getUrl', function (assert) {
    assert.expect(3);
    let user = make('user');

    let tests = [
      [[user], `/users/${user.id}`, 'url when using model'],
      [['user', user.id], `/users/${user.id}`, 'url when using modelName, id'],
      [['user'], `/users/:id`, 'url when not using id'],
    ];

    for (let test of tests) {
      let [args, expectedUrl, message] = test;
      let mock = mockUpdate(...args),
        url = mock.getUrl();

      assert.strictEqual(url, expectedUrl, message);
    }
  });

  test('#getUrl uses urlForUpdateRecord if it is set on the adapter', function (assert) {
    let mock1 = mockUpdate('user', '1');
    assert.strictEqual(mock1.getUrl(), '/users/1');

    let adapter = FactoryGuy.store.adapterFor('user');
    sinon.stub(adapter, 'urlForUpdateRecord').returns('/dudes/1');

    assert.strictEqual(mock1.getUrl(), '/dudes/1');
  });
});
