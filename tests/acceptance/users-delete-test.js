import {test} from 'qunit';
import {mockFindAll, mockDelete, makeList} from 'ember-data-factory-guy';
import moduleForAcceptance from '../helpers/module-for-acceptance';

moduleForAcceptance('Acceptance | Users Delete');
// NOTE
// FactoryGuy before and after setup is in moduleForAcceptance helper

test("Deleting any user with modelName", async function(assert) {
  mockFindAll('user', 2);
  mockDelete('user');
  await visit('/users');

  assert.ok(find('li.user').length === 2);

  await click('li.user:first button');

  assert.ok(find('li.user').length === 1);

  await click('li.user:first button');

  assert.ok(find('li.user').length === 0);
});

test("Deleting a user with model", async function(assert) {
  const users = makeList('user', 2);
  const user = users[0];
  mockFindAll('user').returns({ models: users });
  mockDelete(user);
  await visit('/users');

  assert.ok(find('li.user').length === 2);

  await click('li.user:first button');

  assert.ok(find('li.user').length === 1);
});

test("Deleting a user with modelName and id", async function(assert) {
  mockFindAll('user', 2);
  mockDelete('user', '1');
  await visit('/users');

  assert.ok(find('li.user').length === 2);
  await click('li.user:first button');

  assert.ok(find('li.user').length === 1);
});
