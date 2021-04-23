import { run } from '@ember/runloop';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import FactoryGuy, { make, mockDelete } from 'ember-data-factory-guy';
import { inlineSetup } from '../../helpers/utility-methods';
import sinon from 'sinon';

const serializerType = '-json-api';

module('MockDelete', function (hooks) {
  setupTest(hooks);
  inlineSetup(hooks, serializerType);

  test('mockId', function (assert) {
    let user = make('user'),
      mock = mockDelete(user);

    assert.deepEqual(mock.mockId, {
      type: 'DELETE',
      url: `/users/${user.id}`,
      num: 0,
    });
  });

  test('with incorrect parameters', function (assert) {
    assert.throws(function () {
      mockDelete();
    }, 'missing modelName');
  });

  test('logging response', async function (assert) {
    FactoryGuy.settings({ logLevel: 1 });

    let profile = make('profile');
    const consoleStub = sinon.spy(console, 'log'),
      mock = mockDelete(profile);

    await run(async () => profile.destroyRecord());

    let response = JSON.parse(mock.actualResponseJson()),
      expectedArgs = [
        '[factory-guy]',
        'MockDelete',
        'DELETE',
        '[200]',
        `/profiles/1`,
        response,
      ];

    assert.deepEqual(consoleStub.getCall(0).args, expectedArgs);

    console.log.restore();
  });

  test('#getUrl uses urlForDeleteRecord if it is set on the adapter', function (assert) {
    let mock1 = mockDelete('user', '2');
    assert.equal(mock1.getUrl(), '/users/2');

    let adapter = FactoryGuy.store.adapterFor('user');
    sinon.stub(adapter, 'urlForDeleteRecord').returns('/deleteMyZombie/2');

    assert.equal(mock1.getUrl(), '/deleteMyZombie/2');
    adapter.urlForDeleteRecord.restore();
  });

  test('#makeFakeSnapshot', function (assert) {
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
      let mock = mockDelete(...args),
        snapshot = mock.makeFakeSnapshot(),
        { record } = snapshot;
      assert.deepEqual(record, expectedRecord, message);
    }
  });
});
