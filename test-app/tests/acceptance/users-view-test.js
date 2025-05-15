import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { buildList, makeList, mockFindAll } from 'ember-data-factory-guy';
import { visit } from '@ember/test-helpers';
import { inlineSetup } from '../helpers/utility-methods';

module('Acceptance | Users View', function (hooks) {
  setupApplicationTest(hooks);
  inlineSetup(hooks, '-json-api');

  test('Show users by using mockFindAll to create default users', async function (assert) {
    mockFindAll('user', 3);
    await visit('/users');

    assert.dom('li.user').exists({ count: 3 });
  });

  test('Show users with projects by build(ing) json and using returns with json', async function (assert) {
    // build a json payload with list of users
    let users = buildList('user', 1);
    mockFindAll('user').returns({ json: users });

    await visit('/users');

    assert.dom('li.user').exists({ count: 1 });
  });

  test('Show users by make(ing) list of models and using returns with those models', async function (assert) {
    // make a user with projects ( which will be in the store )
    let [bo, bif] = makeList('user', { name: 'Bo' }, { name: 'Bif' });
    mockFindAll('user').returns({ models: [bo, bif] });

    await visit('/users');

    assert.dom('li.user:nth-child(1)').containsText(bo.get('name'));
    assert.dom('li.user:nth-child(2)').containsText(bif.get('name'));
  });

  test('reuse mockFindAll to show return different users', async function (assert) {
    let mock = mockFindAll('user'); // returns no users

    await visit('/users');

    assert.dom('li.user').doesNotExist();

    let [bo, bif] = makeList('user', { name: 'Bo' }, { name: 'Bif' });
    mock.returns({ models: [bo, bif] });
    await visit('/users');

    assert.dom('.user').exists({ count: 2 });
    assert.dom('.user:nth-child(1)').containsText(bo.get('name'));
    assert.dom('.user:nth-child(2)').containsText(bif.get('name'));
  });
});
