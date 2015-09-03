import Ember from 'ember';

import TestHelper from 'ember-data-factory-guy/factory-guy-test-helper';
import startApp from '../helpers/start-app';

var App;

module('Users Delete', {
  beforeEach: function () {
    Ember.run(function () {
      App = startApp();
      TestHelper.setup();
    });
  },
  afterEach: function () {
    Ember.run(function () {
      TestHelper.teardown();
      App.destroy();
    });
  }
});


test("Deleting a user", function () {
  TestHelper.handleFindAll('user', 2);
  visit('/users');

  andThen(function () {
    TestHelper.handleDelete('user', '1');
    click('li.user:first button');
  });
  andThen(function(){
    var users = find('li.user');
    ok(users.length === 1);
  });
});
