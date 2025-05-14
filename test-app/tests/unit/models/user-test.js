import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import FactoryGuy, {
  make,
  setupFactoryGuy,
  mockFindRecord,
} from 'ember-data-factory-guy';

module(`Unit | Model | user`, function (hooks) {
  setupTest(hooks);
  setupFactoryGuy(hooks);

  test('has funny name', function (assert) {
    let user = make('user', { name: 'Dude' });
    assert.strictEqual(user.get('funnyName'), 'funny Dude');
  });

  test('has projects', function (assert) {
    let user = make('user', 'with_projects');
    assert.strictEqual(user.get('projects.length'), 2);
  });

  test('sample async unit test with async/await', async function (assert) {
    let mock = mockFindRecord('user');
    let userId = mock.get('id');
    let user = await FactoryGuy.store.findRecord('user', userId);
    assert.strictEqual(user.get('name'), mock.get('name'));
  });

  test('sample async unit test with assert.async()', async function (assert) {
    let mock = mockFindRecord('user');
    let userId = mock.get('id');
    const user = await FactoryGuy.store.findRecord('user', userId);

    assert.strictEqual(user.get('name'), mock.get('name'));
  });
});
