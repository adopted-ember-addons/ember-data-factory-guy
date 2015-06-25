import Ember from 'ember';
import FactoryGuy, { make } from 'ember-data-factory-guy';

/**
 *  This test is NOT using startApp function or App.destroy for cleanup,
 * so it is alot faster. Ember-Qunit starts an application for you at the
 * beginning of the test run, so for model tests, you don't need to start
 * it again (to get your own copy of a new application).
 *
 *  As long as your model tests keep clearing the store after every test,
 * tests will be simpler, and faster with this style.
 *
 *  If this does not work for you ( for whatever reason ) take a look at
 *  profile-test.js in this same directory for the fool proof way to write a
 *  model test.
 */

module('User Model', {
  afterEach: function() {
    Ember.run(FactoryGuy, 'clearStore');
  }
});

test('has funny name', function() {
  var user = make('user', {name: 'Dude'});
  equal(user.get('funnyName'), 'funny Dude');
});

test('has projects', function() {
  var user = make('user', 'with_projects');
  equal(user.get('projects.length'), 2);
});
