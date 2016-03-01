import { mockFindAll, mockDelete } from 'ember-data-factory-guy';
import moduleForAcceptance from '../helpers/module-for-acceptance';

moduleForAcceptance('Acceptance | Users Delete');
// NOTE
// FactoryGuy before and after setup is in moduleForAcceptance helper

test("Deleting a user", function () {
  mockFindAll('user', 2);
  visit('/users');

  andThen(()=> {
    mockDelete('user', '1');
    click('li.user:first button');
  });

  andThen(()=>{
    let users = find('li.user');
    ok(users.length === 1);
  });
});
