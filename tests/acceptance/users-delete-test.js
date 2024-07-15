/* eslint-disable ember/no-settled-after-test-helper */
import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import {
  makeList,
  mockDelete,
  mockFindAll,
  setupFactoryGuy,
} from 'ember-data-factory-guy';
import { click, settled, visit } from '@ember/test-helpers';

module('Acceptance | Users Delete', function (hooks) {
  setupApplicationTest(hooks);
  setupFactoryGuy(hooks);

  test('Deleting any user with modelName', async function (assert) {
    mockFindAll('user', 2);
    mockDelete('user');
    await visit('/users');

    assert.dom('li.user').exists({ count: 2 });

    await click('li.user:nth-child(1) button');
    await settled();

    assert.dom('li.user').exists({ count: 1 });

    await click('li.user:nth-child(1) button');
    await settled();

    assert.dom('li.user').doesNotExist();
  });

  test('Deleting a user with model', async function (assert) {
    const users = makeList('user', 2);
    const user = users[0];
    mockFindAll('user').returns({ models: users });
    mockDelete(user);
    await visit('/users');

    assert.dom('li.user').exists({ count: 2 });

    await click('li.user:nth-child(1) button');
    await settled();

    assert.dom('li.user').exists({ count: 1 });
  });

  test('Deleting a user with modelName and id', async function (assert) {
    mockFindAll('user', 2);
    mockDelete('user', '1');
    await visit('/users');

    assert.dom('li.user').exists({ count: 2 });
    await click('li.user:nth-child(1) button');
    await settled();

    assert.dom('li.user').exists({ count: 1 });
  });
});
