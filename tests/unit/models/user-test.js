import Ember from 'ember';
import { make, clearStore } from 'ember-data-factory-guy';
import startApp from '../../helpers/start-app';

var App;

module('User', {
  setup: function() {
    Ember.run(function() {
      App = startApp();
    });
  },
  teardown: function() {
    Ember.run(function() {
      App.destroy();
    });
  }
});

test('has funny name', function() {
  var user = make('user', {name: 'Dude'});
  equal(user.get('funnyName'), 'funny Dude');
});

test('it has projects', function() {
  var user = make('user', 'with_projects');
  equal(user.get('projects.length'), 2);
});
