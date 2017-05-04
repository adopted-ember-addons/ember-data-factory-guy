import {test} from 'qunit';
import {buildList, makeList, mockFindAll} from 'ember-data-factory-guy';
import moduleForAcceptance from '../helpers/module-for-acceptance';

moduleForAcceptance('Acceptance | Users View');
// NOTE
// FactoryGuy before and after setup is in moduleForAcceptance helper

test("Show users by using mockFindAll to create default users", async function(assert) {
  mockFindAll('user', 3);
  await visit('/users');

  let users = find('li.user');
  assert.ok(users.length === 3);
});

test("Show users with projects by build(ing) json and using returns with json", async function(assert) {
  // build a json payload with list of users
  let users = buildList('user', 1);
  mockFindAll('user').returns({ json: users });

  await visit('/users');

  assert.ok(find('li.user').length === 1);
});

test("Show users by make(ing) list of models and using returns with those models", async function(assert) {
  // make a user with projects ( which will be in the store )
  let [bo, bif] = makeList('user', { name: "Bo" }, { name: "Bif" });
  mockFindAll('user').returns({ models: [bo, bif] });

  await visit('/users');

  assert.ok(find('li.user:first').text().match(bo.get('name')));
  assert.ok(find('li.user:last').text().match(bif.get('name')));
});

test("reuse mockFindAll to show return different users", async function(assert) {
  let mock = mockFindAll('user'); // returns no users

  await visit('/users');

  assert.equal(find('li.user').length, 0);

  let [bo, bif] = makeList('user', { name: "Bo" }, { name: "Bif" });
  mock.returns({ models: [bo, bif] });
  await visit('/users');

  assert.equal(find('.user').length, 2);
  assert.ok(find('.user:first').text().match(bo.get('name')));
  assert.ok(find('.user:last').text().match(bif.get('name')));
});

