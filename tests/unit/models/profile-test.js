import Ember from 'ember';
import FactoryGuy, { make } from 'ember-data-factory-guy';

/**
 * This test actually is NOT using startApp function or App.destroy for cleanup,
 * so it is alot faster. Ember-Qunit starts an application for you at the beginning of
 * the test run, so for model tests, you don't need to start it again
 * (to get your own copy of a new application).
 * Every model test can do this and as long as you keep clearing the store
 * after every test.
 */
module('Profile Model', {
  afterEach: function() {
    Ember.run(FactoryGuy, 'clearStore');
  }
});

test('has company', function() {
  var profile = make('profile', 'with_company');
  ok(profile.get('company.profile') === profile);
});