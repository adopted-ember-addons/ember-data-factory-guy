import { build, buildList, makeList, mockFindAll } from 'ember-data-factory-guy';
import moduleForAcceptance from '../helpers/module-for-acceptance';

moduleForAcceptance('Acceptance | Users View');
// NOTE
// FactoryGuy before and after setup is in moduleForAcceptance helper

test("Show users by using mockFindAll to create default users", function() {
  mockFindAll('user', 3);
  visit('/users');

  andThen(()=> {
    let users = find('li.user');
    ok(users.length === 3);
  });
});

test("Show users with projects by build(ing) json and using returns with json", function() {
  // build a json payload with list of users
  let users = buildList('user', 1);
  mockFindAll('user').returns({ json: users });

  visit('/users');

  andThen(()=> {
    let users = find('li.user');
    ok(users.length === 1);
  });
});

test("Show users by make(ing) list of models and using returns with those models", function() {
  // make a user with projects ( which will be in the store )
  let users = makeList('user', { name: "Bo" }, { name: "Bif" });
  mockFindAll('user').returns({ models: users });

  visit('/users');

  andThen(()=> {
    let users = find('li.user');
    ok(find('li.user:first').text().match(users.get('firstObject.name')));
    ok(find('li.user:last').text().match(users.get('lastObject.name')));
  });

});

