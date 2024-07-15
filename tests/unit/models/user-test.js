import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import FactoryGuy, {
  make,
  setupFactoryGuy,
  mockFindRecord,
} from 'ember-data-factory-guy';

const modelType = 'user';

module(`Unit | Model | ${modelType}`, function (hooks) {
  setupTest(hooks);
  setupFactoryGuy(hooks);

  test('has funny name', function (assert) {
    let user = make('user', { name: 'Dude' });
    assert.strictEqual(user.funnyName, 'funny Dude');
  });

  test('has projects', function (assert) {
    let user = make('user', 'with_projects');
    assert.strictEqual(user.projects?.length, 2);
  });

  test('sample async unit test with async/await', async function (assert) {
    let mock = mockFindRecord('user');
    let userId = String(mock.get('id'));
    let user = await FactoryGuy.store.findRecord('user', userId);
    assert.strictEqual(user.name, mock.get('name'));
  });

  test('sample async unit test with assert.async()', async function (assert) {
    let mock = mockFindRecord('user');
    let userId = String(mock.get('id'));
    const user = await FactoryGuy.store.findRecord('user', userId);
    assert.strictEqual(user.name, mock.get('name'));
  });
});
