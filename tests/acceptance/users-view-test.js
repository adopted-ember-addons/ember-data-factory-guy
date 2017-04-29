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

test("Show users with projects by build(ing) json and using returns with json", function(assert) {
  // build a json payload with list of users
  let users = buildList('user', 1);
  mockFindAll('user').returns({ json: users });

  visit('/users');

  andThen(() => {
    let users = find('li.user');
    assert.ok(users.length === 1);
  });
});

test("Show users by make(ing) list of models and using returns with those models", function(assert) {
  // make a user with projects ( which will be in the store )
  let users = makeList('user', { name: "Bo" }, { name: "Bif" });
  mockFindAll('user').returns({ models: users });

  visit('/users');

  andThen(() => {
    let users = find('li.user');
    assert.ok(find('li.user:first').text().match(users.get('firstObject.name')));
    assert.ok(find('li.user:last').text().match(users.get('lastObject.name')));
  });

});

test("reuse mockFindAll to show return different users", function(assert) {
  let mock = mockFindAll('user'); // returns no users

  visit('/users');

  andThen(() => {
    assert.equal(find('li.user').length, 0);
    let sillyPeople = makeList('user', { name: "Bo" }, { name: "Bif" });
    mock.returns({ models: sillyPeople });
    visit('/users');
  });

  andThen(() => {
    assert.equal(find('.user').length, 2);
    assert.ok(find('.user:first').text().match("Bo"));
    assert.ok(find('.user:last').text().match("Bif"));
  });

});

