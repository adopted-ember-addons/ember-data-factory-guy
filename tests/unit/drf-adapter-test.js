import Ember from 'ember';
import {moduleFor, test} from 'ember-qunit';
import FactoryGuy, {buildList, mockQuery} from 'ember-data-factory-guy';

import SharedFactoryGuyTestHelperBehavior from './shared-factory-guy-test-helper-tests';
import {inlineSetup} from '../helpers/utility-methods';
import {isEquivalent} from 'ember-data-factory-guy/utils/helper-functions';

let serializer = 'DRFSerializer';
let serializerType = '-drf';

SharedFactoryGuyTestHelperBehavior.mockFindRecordEmbeddedTests(serializer, serializerType);
SharedFactoryGuyTestHelperBehavior.mockFindAllEmbeddedTests(serializer, serializerType);

moduleFor('serializer:application', `${serializer} #mockFindRecord`, inlineSetup(serializerType));
SharedFactoryGuyTestHelperBehavior.mockFindRecordCommonTests();

moduleFor('serializer:application', `${serializer} #mockReload`, inlineSetup(serializerType));
SharedFactoryGuyTestHelperBehavior.mockReloadTests();

moduleFor('serializer:application', `${serializer} #mockFindAll`, inlineSetup(serializerType));
SharedFactoryGuyTestHelperBehavior.mockFindAllCommonTests();

moduleFor('serializer:application', `${serializer} #mockQuery`, inlineSetup(serializerType));
SharedFactoryGuyTestHelperBehavior.mockQueryTests();

moduleFor('serializer:application', `${serializer} #mockQueryRecord`, inlineSetup(serializerType));
SharedFactoryGuyTestHelperBehavior.mockQueryRecordTests();

moduleFor('serializer:application', `${serializer} #mockCreate`, inlineSetup(serializerType));
SharedFactoryGuyTestHelperBehavior.mockCreateTests();
SharedFactoryGuyTestHelperBehavior.mockCreateReturnsEmbeddedAssociations(serializer, serializerType);

moduleFor('serializer:application', `${serializer} #mockUpdate`, inlineSetup(serializerType));
SharedFactoryGuyTestHelperBehavior.mockUpdateTests();
SharedFactoryGuyTestHelperBehavior.mockUpdateReturnsEmbeddedAssociations(serializer, serializerType);

moduleFor('serializer:application', `${serializer} #mockDelete`, inlineSetup(serializerType));
SharedFactoryGuyTestHelperBehavior.mockDeleteTests();

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

