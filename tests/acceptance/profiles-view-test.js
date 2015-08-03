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


test("Handles differently cased attributes", function () {

  TestHelper.handleFindAll('profile', 2);
  visit('/profiles');

  andThen(function () {
    equal(find('.profile:first [data-field=description]').text(), 'Text goes here');
    equal(find('.profile:first [data-field=camelCaseDescription]').text(), 'textGoesHere');
    equal(find('.profile:first [data-field=snake_case_description]').text(), 'text_goes_here');
  });
});
