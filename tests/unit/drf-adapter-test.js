import { run } from '@ember/runloop';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import FactoryGuy, {
  build,
  buildList,
  mockQuery,
} from 'ember-data-factory-guy';
import SharedAdapterBehaviour from './shared-adapter-behaviour';
import { inlineSetup } from '../helpers/utility-methods';
import { isEquivalent } from 'ember-data-factory-guy/utils/helper-functions';

let serializer = 'DRFSerializer';
let serializerType = '-drf';

module(serializer, function (hooks) {
  setupTest(hooks);
  inlineSetup(hooks, serializerType);

  SharedAdapterBehaviour.mockFindRecordEmbeddedTests();
  SharedAdapterBehaviour.mockFindAllEmbeddedTests();

  module(`#mockFindRecord`, function () {
    SharedAdapterBehaviour.mockFindRecordCommonTests();
  });
  module(`#mockReload`, function () {
    SharedAdapterBehaviour.mockReloadTests();
  });
  module(`#mockFindAll`, function () {
    SharedAdapterBehaviour.mockFindAllCommonTests();
  });
  module(`#mockQuery`, function () {
    SharedAdapterBehaviour.mockQueryTests();
  });
  module(`#mockQueryRecord`, function () {
    SharedAdapterBehaviour.mockQueryRecordTests();
  });
  module(`#mockCreate`, function () {
    SharedAdapterBehaviour.mockCreateTests();
    SharedAdapterBehaviour.mockCreateReturnsEmbeddedAssociations(
      serializer,
      serializerType
    );
  });
  module(`#mockUpdate`, function () {
    SharedAdapterBehaviour.mockUpdateTests();
    SharedAdapterBehaviour.mockUpdateReturnsEmbeddedAssociations(
      serializer,
      serializerType
    );
  });
  module(`#mockDelete`, function () {
    SharedAdapterBehaviour.mockDeleteTests();
  });

  module(`DRFAdapter | #mockQuery | meta`, function () {
    // drf serializer takes the previous and next and extracts the page number
    // so this needed it's own test
    test('with proxy payload', function (assert) {
      run(() => {
        let done = assert.async();
        let json = buildList('profile', 2).add({
          meta: { previous: 'http://dude?page=1', next: 'http://dude?page=3' },
        });
        mockQuery('profile', {}).returns({ json });

        FactoryGuy.store.query('profile', {}).then(function (profiles) {
          assert.ok(
            isEquivalent(profiles.get('meta'), {
              previous: 1,
              next: 3,
              count: 2,
            })
          );
          done();
        });
      });
    });
  });

  module(`FactoryGuy#build get`, function () {
    test('returns all attributes with no key', function (assert) {
      let user = build('user');

      assert.deepEqual(user.get(), { id: 1, name: 'User1', style: 'normal' });
      assert.equal(user.get().id, 1);
      assert.equal(user.get().name, 'User1');
    });
  });
});
