import { module, test } from 'qunit';
import {
  buildList,
  make,
  makeList,
  mockQuery,
  setupFactoryGuy,
} from '@eflexsystems/ember-data-factory-guy';
import { setupApplicationTest } from 'ember-qunit';
import { click, fillIn, visit } from '@ember/test-helpers';

module('Acceptance | User Search', function (hooks) {
  setupApplicationTest(hooks);
  setupFactoryGuy(hooks);

  var search = async function (name) {
    await fillIn('input.user-name', name);
    return click('button.find-user');
  };

  test('mockQuery without params matches store.query with any parameters', async function (assert) {
    let dude = buildList('user', { name: 'Dude' });

    // no query parameters set in the mock so it will match
    // a query for {name: "Bif"} and return the dude
    mockQuery('user').returns({ json: dude });

    await visit('/search');
    await search('Bif'); // still returns dude

    assert.dom('.user .name').containsText('Dude');
  });

  test('mockQuery with params matches store.query with those parameters', async function (assert) {
    let dude = buildList('user', { name: 'Dude' });

    // asking to mock only exact match of 'user'
    // with these parameters: {name: "Dude"}
    mockQuery('user', { name: 'Dude' }).returns({ json: dude });

    await visit('/search');
    await search('Dude'); // still returns dude

    assert.dom('.user .name').exists({ count: 1 });
    assert.dom('.user .name').containsText('Dude');
  });

  test('reusing mockQuery to return different results with different parameters', async function (assert) {
    let sillyPeople = buildList('user', { name: 'Bo' }, { name: 'Bif' });

    // nothing is returned with these parameters: {name: "Dude"}
    let mock = mockQuery('user', { name: 'Dude' });

    await visit('/search');
    await search('Dude');

    assert.dom('.user .name').doesNotExist();

    mock.withParams({ name: 'silly' }).returns({ json: sillyPeople });
    await search('silly');

    assert.dom('.user .name').exists({ count: 2 }, '2 names');
    assert.dom('.user:nth-child(1) .name').containsText('Bo');
    assert.dom('.user:nth-child(2) .name').containsText('Bif');
  });

  test('using returns( models )', async function (assert) {
    let bobs = makeList('bob', 2);

    mockQuery('user', { name: 'bob' }).returns({ models: bobs });

    await visit('/search');
    await search('bob');

    assert.dom('.user').exists({ count: 2 });
  });

  test('using returns( ids )', async function (assert) {
    let bob = make('bob');
    make('user');

    mockQuery('user').returns({ ids: [bob.id] });

    await visit('/search');
    await search('user2');

    assert.dom('.user').exists({ count: 1 });
    assert.dom('.user .name').containsText('Bob');
  });

  test('Load meta data returned from the server', async function (assert) {
    let users = buildList('user', 1).add({
      meta: { previous: '/search?page=1', next: '/search?page=3' },
    });
    mockQuery('user').returns({ json: users });

    await visit('/search');
    await search('Anyone');

    assert.dom('.meta').exists({ count: 2 });
  });

  test('using fails to mock a failed query', async function (assert) {
    let errors = { errors: { description: ['invalid'] } };
    mockQuery('user').fails({ status: 422, response: errors });

    await visit('/search');
    await search('Allen');

    assert.dom('.results').containsText('Errors');
  });
});
