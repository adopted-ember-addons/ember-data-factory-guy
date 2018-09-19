import { run } from '@ember/runloop';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import FactoryGuy, {
  make,
  setupFactoryGuy,
  mockFindRecord
} from 'ember-data-factory-guy';

const modelType = 'user';

module(`Unit | Model | ${modelType}`, function(hooks) {
  setupTest(hooks);
  setupFactoryGuy(hooks);

  test('has funny name', function(assert) {
    let user = make('user', {name: 'Dude'});
    assert.equal(user.get('funnyName'), 'funny Dude');
  });

  test('has projects', function(assert) {
    let user = make('user', 'with_projects');
    assert.equal(user.get('projects.length'), 2);
  });

  test('sample async unit test with async/await', async function(assert) {
    run(async () => {
      let mock = mockFindRecord('user');
      let userId = mock.get('id');
      let user = await FactoryGuy.store.findRecord('user', userId);
      assert.equal(user.get('name'), mock.get('name'));
    });
  });

  test('sample async unit test with assert.async()', function(assert) {
    let done = assert.async();
    run(() => {
      let mock = mockFindRecord('user');
      let userId = mock.get('id');
      FactoryGuy.store.findRecord('user', userId).then((user) => {
        assert.equal(user.get('name'), mock.get('name'));
        done();
      });
    });
  });
});
