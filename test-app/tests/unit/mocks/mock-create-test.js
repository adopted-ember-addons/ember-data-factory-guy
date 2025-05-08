import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import Model from '@ember-data/model';
import FactoryGuy, { build, makeNew, mockCreate } from 'ember-data-factory-guy';
import { inlineSetup } from '../../helpers/utility-methods';
import sinon from 'sinon';

const serializerType = '-json-api';

module('MockCreate', function (hooks) {
  setupTest(hooks);
  inlineSetup(hooks, serializerType);

  test('with incorrect parameters', function (assert) {
    assert.throws(function () {
      mockCreate();
    }, 'missing modelName');
  });

  test('mockId', function (assert) {
    let mock = mockCreate('user');

    assert.deepEqual(mock.mockId, { type: 'POST', url: `/users`, num: 0 });
  });

  test('logging response', async function (assert) {
    FactoryGuy.settings({ logLevel: 1 });

    const consoleStub = sinon.spy(console, 'log'),
      profile = makeNew('profile'),
      mock = mockCreate(profile).returns({ attrs: { id: 2 } });

    await profile.save();

    let response = JSON.parse(mock.getResponse().responseText),
      expectedArgs = [
        '[factory-guy]',
        'MockCreate',
        'POST',
        '[200]',
        `/profiles`,
        response,
      ];

    assert.deepEqual(consoleStub.getCall(0).args, expectedArgs);

    console.log.restore();
  });

  test('#singleUse', async function (assert) {
    let user1 = build('user');
    let user2 = build('user');

    mockCreate('user')
      .returns({ attrs: { id: user1.get('id') } })
      .singleUse();
    mockCreate('user').returns({ attrs: { id: user2.get('id') } });

    let model1 = FactoryGuy.store.createRecord('user', user1.get());
    await model1.save();
    assert.strictEqual(model1.id, user1.get('id').toString());

    let model2 = FactoryGuy.store.createRecord('user', user2.get());
    await model2.save();
    assert.strictEqual(model2.id, user2.get('id').toString());
  });

  test('#getUrl uses customized adapter#urlForCreateRecord', function (assert) {
    let mock1 = mockCreate('user');
    assert.strictEqual(mock1.getUrl(), '/users');

    let adapter = FactoryGuy.store.adapterFor('user');
    sinon.stub(adapter, 'urlForCreateRecord').returns('/makeMeAZombie');

    assert.strictEqual(mock1.getUrl(), '/makeMeAZombie');
    adapter.urlForCreateRecord.restore();
  });

  test('snapshot has record and adapterOptions in adapter#urlForCreateRecord', async function (assert) {
    assert.expect(2);
    mockCreate('user');

    let adapter = FactoryGuy.store.adapterFor('user'),
      adapterOptions = { name: 'Bob' };

    let fakeUrlForCreateRecord = function (modelName, snapshot) {
      assert.ok(snapshot.record instanceof Model);
      assert.deepEqual(snapshot.adapterOptions, adapterOptions);
      return '/users';
    };

    sinon.stub(adapter, 'urlForCreateRecord').callsFake(fakeUrlForCreateRecord);

    await FactoryGuy.store.createRecord('user').save({ adapterOptions });

    adapter.urlForCreateRecord.restore();
  });

  test('#makeFakeSnapshot', function (assert) {
    assert.expect(2);
    let user = makeNew('user');

    let tests = [
      [[user], user, 'has record when model in arguments'],
      [
        ['user'],
        undefined,
        'does not have record when only modelName in arguments',
      ],
    ];

    for (let test of tests) {
      let [args, expectedRecord, message] = test;
      let mock = mockCreate(...args),
        snapshot = mock.makeFakeSnapshot(),
        { record } = snapshot;
      assert.deepEqual(record, expectedRecord, message);
    }
  });
});
