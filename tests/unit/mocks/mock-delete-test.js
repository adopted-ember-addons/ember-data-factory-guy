import {moduleFor, test} from 'ember-qunit';
import FactoryGuy, {mockDelete} from 'ember-data-factory-guy';
import {inlineSetup} from '../../helpers/utility-methods';
import sinon from 'sinon';

const serializerType = '-json-api';


moduleFor('serializer:application', 'MockDelete', inlineSetup(serializerType));

test("with incorrect parameters", function(assert) {

  assert.throws(function() {
    mockDelete();
  }, "missing modelName");

});

test("#getUrl uses urlForDeleteRecord if it is set on the adapter", function(assert) {
  let mock1 = mockDelete('user', '2');
  assert.equal(mock1.getUrl(), '/users/2');

  let adapter = FactoryGuy.store.adapterFor('user');
  sinon.stub(adapter, 'urlForDeleteRecord').returns('/deleteMyZombie/2');

  assert.equal(mock1.getUrl(), '/deleteMyZombie/2');
  adapter.urlForDeleteRecord.restore();
});
