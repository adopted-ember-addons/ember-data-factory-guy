import Ember from 'ember';
import { moduleFor, test } from 'ember-qunit';
import Model from 'ember-data/model';
import FactoryGuy, { build, makeNew, mockCreate } from 'ember-data-factory-guy';
import { inlineSetup } from '../../helpers/utility-methods';
import sinon from 'sinon';

const serializerType = '-json-api';

moduleFor('serializer:application', 'MockCreate', inlineSetup(serializerType));

test("with incorrect parameters", function(assert) {

  assert.throws(function() {
    mockCreate();
  }, "missing modelName");

});

test("logging response", async function(assert) {
  FactoryGuy.settings({logLevel: 1});

  const consoleStub = sinon.spy(console, 'log'),
        profile     = makeNew('profile'),
        mock        = mockCreate(profile).returns({attrs: {id: 2}});

  await Ember.run(async () => profile.save());

  let response     = JSON.parse(mock.getResponse().responseText),
      expectedArgs = [
        "[factory-guy]",
        "MockCreate",
        "POST",
        "[200]",
        `/profiles`,
        response
      ];

  assert.deepEqual(consoleStub.getCall(0).args, expectedArgs);

  console.log.restore();
});

test("#singleUse", async function(assert) {
  let user1 = build('user');
  let user2 = build('user');

  mockCreate('user').returns({attrs: {id: user1.get('id')}}).singleUse();
  mockCreate('user').returns({attrs: {id: user2.get('id')}});

  Ember.run(async () => {
    let model1 = FactoryGuy.store.createRecord('user', user1.get());
    await model1.save();
    assert.equal(model1.id, user1.get('id'));
  });

  Ember.run(async () => {
    let model2 = FactoryGuy.store.createRecord('user', user2.get());
    await model2.save();
    assert.equal(model2.id, user2.get('id'));
  });
});

test("#getUrl uses urlForCreateRecord if it is set on the adapter", function(assert) {
  let mock1 = mockCreate('user');
  assert.equal(mock1.getUrl(), '/users');

  let adapter = FactoryGuy.store.adapterFor('user');
  sinon.stub(adapter, 'urlForCreateRecord').returns('/makeMeAZombie');

  assert.equal(mock1.getUrl(), '/makeMeAZombie');
  adapter.urlForCreateRecord.restore();
});

test('snapshot has record and adapterOptions in adapter#urlForCreateRecord', async function(assert) {
  mockCreate('user');

  let adapter        = FactoryGuy.store.adapterFor('user'),
      adapterOptions = {name: 'Bob'};

  let fakeUrlForCreateRecord = function(modelName, snapshot) {
    assert.ok(snapshot.record instanceof Model);
    assert.deepEqual(snapshot.adapterOptions, adapterOptions);
    return '/users';
  };

  sinon.stub(adapter, 'urlForCreateRecord').callsFake(fakeUrlForCreateRecord);

  await Ember.run(() => {
    return FactoryGuy.store.createRecord('user').save({adapterOptions});
  });
  adapter.urlForCreateRecord.restore();
});
