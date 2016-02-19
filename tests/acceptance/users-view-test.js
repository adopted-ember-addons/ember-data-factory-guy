import fgHelper from 'ember-data-factory-guy/factory-guy-test-helper';
import moduleForAcceptance from '../helpers/module-for-acceptance';

moduleForAcceptance('Acceptance | Users View', {
  beforeEach: function () {
    fgHelper.setup();
  },
  afterEach: function () {
    fgHelper.teardown();
  }
});

test("Showing all users", function () {
  fgHelper.handleFindAll('user', 2);
  visit('/users');

  andThen(function () {
    let users = find('li.user');
    ok(users.length === 2);
  });
});
