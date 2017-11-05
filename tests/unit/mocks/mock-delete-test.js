import Ember from 'ember';
import { moduleFor, test } from 'ember-qunit';
import FactoryGuy, { make, mockDelete } from 'ember-data-factory-guy';
import { inlineSetup } from '../../helpers/utility-methods';
import sinon from 'sinon';

const serializerType = '-json-api';


moduleFor('serializer:application', 'MockDelete', inlineSetup(serializerType));

test("with incorrect parameters", function(assert) {

  assert.throws(function() {
    mockDelete();
  }, "missing modelName");

});

test("logging response", async function(assert) {
  FactoryGuy.settings({logLevel: 1});

  let profile = make('profile');
  const consoleStub = sinon.spy(console, 'log'),
        mock        = mockDelete(profile);

  await Ember.run(async () => profile.destroyRecord());

  let response     = JSON.parse(mock.actualResponseJson()),
      expectedArgs = [
        "[factory-guy]",
        "MockDelete",
        "DELETE",
        "[200]",
        `/profiles/1`,
        response
      ];

  assert.deepEqual(consoleStub.getCall(0).args, expectedArgs);

  console.log.restore();
});

test("#getUrl uses urlForDeleteRecord if it is set on the adapter", function(assert) {
  let mock1 = mockDelete('user', '2');
  assert.equal(mock1.getUrl(), '/users/2');

  let adapter = FactoryGuy.store.adapterFor('user');
  sinon.stub(adapter, 'urlForDeleteRecord').returns('/deleteMyZombie/2');

  assert.equal(mock1.getUrl(), '/deleteMyZombie/2');
  adapter.urlForDeleteRecord.restore();
});
