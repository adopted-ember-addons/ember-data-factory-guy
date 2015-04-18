import Ember from 'ember';

import { make } from 'ember-data-factory-guy';
import TestHelper from 'ember-data-factory-guy/factory-guy-test-helper';

import startApp from '../helpers/start-app';

var App, user;

module('User View', {
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


test("Showing all users", function () {

  TestHelper.handleFindAll('user', 2);
  visit('/users');

  andThen(function () {
    var users = find('li.user');
    ok(users.length === 2);
  });
});
