import fgHelper from 'ember-data-factory-guy/factory-guy-test-helper';
import moduleForAcceptance from '../helpers/module-for-acceptance';

moduleForAcceptance('Acceptance | Users Delete', {
  beforeEach: function () {
    fgHelper.setup();
  },
  afterEach: function () {
    fgHelper.teardown();
  }
});


test("Deleting a user", function () {
  fgHelper.handleFindAll('user', 2);
  visit('/users');

  andThen(function () {
    fgHelper.handleDelete('user', '1');
    click('li.user:first button');
  });
  andThen(function(){
    var users = find('li.user');
    ok(users.length === 1);
  });
});
