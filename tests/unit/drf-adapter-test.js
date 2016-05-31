import Ember from 'ember';
import FactoryGuy, { build, buildList, make, makeList, mockFind, mockFindAll, mockQuery } from 'ember-data-factory-guy';

import SharedAdapterBehavior from './shared-adapter-tests';
import SharedFactoryGuyTestHelperBehavior from './shared-factory-guy-test-helper-tests';
import { title, inlineSetup } from '../helpers/utility-methods';
import { isEquivalent } from 'ember-data-factory-guy/utils/helper-functions';

let App = null;
let adapter = 'DRFAdapeter';
let serializerType = '-drf';

SharedFactoryGuyTestHelperBehavior.mockFindEmbeddedTests(App, adapter, serializerType);
SharedFactoryGuyTestHelperBehavior.mockFindAllEmbeddedTests(App, adapter, serializerType);

module(title(adapter, '#mockFind'), inlineSetup(App, serializerType));
SharedFactoryGuyTestHelperBehavior.mockFindCommonTests();

module(title(adapter, '#mockReload'), inlineSetup(App, serializerType));
SharedFactoryGuyTestHelperBehavior.mockReloadTests();

module(title(adapter, '#mockFindAll'), inlineSetup(App, serializerType));
SharedFactoryGuyTestHelperBehavior.mockFindAllCommonTests();

module(title(adapter, '#mockQuery'), inlineSetup(App, serializerType));
SharedFactoryGuyTestHelperBehavior.mockQueryTests();

module(title(adapter, '#mockQueryRecord'), inlineSetup(App, serializerType));
SharedFactoryGuyTestHelperBehavior.mockQueryRecordTests();

module(title(adapter, '#mockCreate'), inlineSetup(App, serializerType));
SharedFactoryGuyTestHelperBehavior.mockCreateTests();
SharedFactoryGuyTestHelperBehavior.mockCreateReturnsEmbeddedAssociations(App, adapter, serializerType);

module(title(adapter, '#mockUpdate'), inlineSetup(App, serializerType));
SharedFactoryGuyTestHelperBehavior.mockUpdateTests();
SharedFactoryGuyTestHelperBehavior.mockUpdateReturnsEmbeddedAssociations(App, adapter, serializerType);

module(title(adapter, '#mockDelete'), inlineSetup(App, serializerType));
SharedFactoryGuyTestHelperBehavior.mockDeleteTests();

module('DRFAdapeter | #mockQuery | meta', inlineSetup(App, serializerType));
// drf serializer takes the previous and next and extracts the page number
// so this needed it's own test
test("with proxy payload", function(assert) {
  Ember.run(()=> {
    let done = assert.async();
    let json = buildList('profile', 2).add({ meta: { previous: 'http://dude?page=1', next: 'http://dude?page=3' } });
    mockQuery('profile', {}).returns({ json });

    FactoryGuy.store.query('profile', {}).then(function(profiles) {
      ok(isEquivalent(profiles.get('meta'), { previous: 1, next: 3, count: 2 }));
      done();
    });
  });
});

