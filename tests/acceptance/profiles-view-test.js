import Ember from 'ember';

import TestHelper from 'ember-data-factory-guy/factory-guy-test-helper';
import startApp from '../helpers/start-app';

var App;

module('Profiles View', {
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


test("Handles camelCase attributes", function () {

  TestHelper.handleFindAll('profile', 2);
  visit('/profiles');

  andThen(function () {
    equal(find('.profile:first .camelcase-description').text(), 'textGoesHere');
  });
});
