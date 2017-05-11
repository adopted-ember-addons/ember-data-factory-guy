import {test} from 'qunit';
import {make, makeList, buildList, mockQuery} from 'ember-data-factory-guy';
import moduleForAcceptance from '../helpers/module-for-acceptance';

moduleForAcceptance('Acceptance | User Search');

// NOTE
// FactoryGuy before and after setup is in moduleForAcceptance helper

var search = function(name) {
  fillIn('input.user-name', name);
  return click('button.find-user');
};

test("mockQuery without params matches store.query with any parameters", async function(assert) {
  let dude = buildList('user', { name: 'Dude' });

  // no query parameters set in the mock so it will match
  // a query for {name: "Bif"} and return the dude
  mockQuery('user').returns({ json: dude });

  await visit('/search');
  await search("Bif"); // still returns dude

  assert.ok(find('.user .name').length === 1);
  assert.ok(find('.user .name').text().match("Dude"));
});

test("mockQuery with params matches store.query with those parameters", async function(assert) {
  let dude = buildList('user', { name: 'Dude' });

  // asking to mock only exact match of 'user'
  // with these parameters: {name: "Dude"}
  mockQuery('user', { name: "Dude" }).returns({ json: dude });

  await visit('/search');
  await search("Dude"); // still returns dude

  assert.ok(find('.user .name').length === 1);
  assert.ok(find('.user .name').text().match("Dude"));
});

test("reusing mockQuery to return different results with different parameters", async function(assert) {
  let sillyPeople = buildList('user', { name: 'Bo' }, { name: "Bif" });

  // nothing is returned with these parameters: {name: "Dude"}
  let mock = mockQuery('user', { name: "Dude" });

  await visit('/search');
  await search("Dude");

  assert.ok(find('.user .name').length === 0);

  mock.withParams({ name: "silly" }).returns({ json: sillyPeople });
  await search("silly");

  assert.ok(find('.user .name').length === 2);
  assert.ok(find('.user .name:first').text().match("Bo"));
  assert.ok(find('.user .name:last').text().match("Bif"));
});

test("using returns( models )", async function(assert) {
  let bobs = makeList("bob", 2);

  mockQuery('user', { name: "bob" }).returns({ models: bobs });

  await visit('/search');
  await search("bob");

  assert.ok(find('.user').length === 2);
});

test("using returns( ids )", async function(assert) {
  let bob = make("bob");
  make("user");

  mockQuery('user').returns({ ids: [bob.id] });

  await visit('/search');
  await search("user2");

  assert.ok(find('.user').length === 1);
  assert.ok(find('.user .name').text().match("Bob"));
});

test('Load meta data returned from the server', async function(assert) {
  let users = buildList('user', 1).add({ meta: { previous: '/search?page=1', next: '/search?page=3' } });
  mockQuery('user').returns({ json: users });

  await visit('/search');
  await search("Anyone");

  assert.equal(find('.meta').length, 2);
});

test("using fails to mock a failed query", async function(assert) {
  let errors = { errors: { description: ['invalid'] } };
  mockQuery('user').fails({ status: 422, response: errors });

  await visit('/search');
  await search("Allen");

  assert.ok(find('.results').text().match('Errors'));
});
