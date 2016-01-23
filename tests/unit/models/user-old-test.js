import Ember from 'ember';
import FactoryGuy, { make } from 'ember-data-factory-guy';

/**
 *  This test is NOT using startApp function or App.destroy for cleanup,
 * so it is alot faster. Ember-Qunit starts an application for you at the
 * beginning of the test run, so for model tests, you don't need to start
 * it again (to get your own copy of a new application).
 *
 * This test not working anymore with ember 2.3, ember-data 2.3
 */

//module('User Model', {
//
//  teardown() {
//    Ember.run(FactoryGuy, 'clearStore');
//  }
//});

//test('has funny name', function() {
//  var user = make('user', {name: 'Dude'});
//  equal(user.get('funnyName'), 'funny Dude');
//});

//test('has projects', function() {
//  var user = make('user', 'with_projects');
//  equal(user.get('projects.length'), 2);
//});
