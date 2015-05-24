import Ember from 'ember';
import FactoryGuy, { make } from 'ember-data-factory-guy';
import startApp from '../../helpers/start-app';

var App;

module('User Model', {
  beforeEach: function () {
    App = startApp();
  },
  afterEach: function() {
    Ember.run(App, 'destroy');
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