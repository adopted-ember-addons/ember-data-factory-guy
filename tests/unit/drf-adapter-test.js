import Ember from 'ember';
import {moduleFor, test} from 'ember-qunit';
import FactoryGuy, {build, buildList, mockQuery} from 'ember-data-factory-guy';

import SharedAdapterBehaviour from './shared-adapter-behaviour';
import {inlineSetup} from '../helpers/utility-methods';
import {isEquivalent} from 'ember-data-factory-guy/utils/helper-functions';

let serializer = 'DRFSerializer';
let serializerType = '-drf';

SharedAdapterBehaviour.mockFindRecordEmbeddedTests(serializer, serializerType);
SharedAdapterBehaviour.mockFindAllEmbeddedTests(serializer, serializerType);

moduleFor('serializer:application', `${serializer} #mockFindRecord`, inlineSetup(serializerType));
SharedAdapterBehaviour.mockFindRecordCommonTests();

moduleFor('serializer:application', `${serializer} #mockReload`, inlineSetup(serializerType));
SharedAdapterBehaviour.mockReloadTests();

moduleFor('serializer:application', `${serializer} #mockFindAll`, inlineSetup(serializerType));
SharedAdapterBehaviour.mockFindAllCommonTests();

moduleFor('serializer:application', `${serializer} #mockQuery`, inlineSetup(serializerType));
SharedAdapterBehaviour.mockQueryTests();

moduleFor('serializer:application', `${serializer} #mockQueryRecord`, inlineSetup(serializerType));
SharedAdapterBehaviour.mockQueryRecordTests();

moduleFor('serializer:application', `${serializer} #mockCreate`, inlineSetup(serializerType));
SharedAdapterBehaviour.mockCreateTests();
SharedAdapterBehaviour.mockCreateReturnsEmbeddedAssociations(serializer, serializerType);

moduleFor('serializer:application', `${serializer} #mockUpdate`, inlineSetup(serializerType));
SharedAdapterBehaviour.mockUpdateTests();
SharedAdapterBehaviour.mockUpdateReturnsEmbeddedAssociations(serializer, serializerType);

moduleFor('serializer:application', `${serializer} #mockDelete`, inlineSetup(serializerType));
SharedAdapterBehaviour.mockDeleteTests();

moduleFor('serializer:application', `${serializer} DRFAdapter | #mockQuery | meta`, inlineSetup(serializerType));
// drf serializer takes the previous and next and extracts the page number
// so this needed it's own test
test("with proxy payload", function(assert) {
  Ember.run(()=> {
    let done = assert.async();
    let json = buildList('profile', 2).add({ meta: { previous: 'http://dude?page=1', next: 'http://dude?page=3' } });
    mockQuery('profile', {}).returns({ json });

    FactoryGuy.store.query('profile', {}).then(function(profiles) {
      assert.ok(isEquivalent(profiles.get('meta'), { previous: 1, next: 3, count: 2 }));
      done();
    });
  });
});

moduleFor('serializer:application', `${serializer} FactoryGuy#build get`, inlineSetup(serializerType));

test("returns all attributes with no key", function(assert) {
  let user = build('user');

  assert.deepEqual(user.get(), { id: 1, name: 'User1', style: "normal" });
  assert.equal(user.get().id, 1);
  assert.equal(user.get().name, 'User1');
});

