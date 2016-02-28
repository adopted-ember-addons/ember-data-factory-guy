import { mockFindAll } from 'ember-data-factory-guy';
import moduleForAcceptance from '../helpers/module-for-acceptance';

moduleForAcceptance('Acceptance | Users View');
// NOTE
// FactoryGuy before and after setup is in moduleForAcceptance helper

test("Showing all users", function () {
  mockFindAll('user', 2);
  visit('/users');

  andThen(function () {
    let users = find('li.user');
    ok(users.length === 2);
  });
});
