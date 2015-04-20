import Ember from 'ember';
import { make, clearStore } from 'ember-data-factory-guy';
import startApp from '../../helpers/start-app';

module('User Model', {
  afterEach: function() {
    Ember.run(function() {clearStore();});
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
