import Ember from 'ember';
import FactoryGuy, { make, clearStore } from 'factory-guy';
import startApp from '../../helpers/start-app';

var App;

module('User', {
  setup: function() {
    App = startApp();
  },
  teardown: function() {
    Ember.run(function() {
      clearStore();
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
