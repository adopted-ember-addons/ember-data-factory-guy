import Ember from 'ember';
import FactoryGuy, { make } from 'ember-data-factory-guy';
import startApp from '../../helpers/start-app';

var App = null;

module('Profile Model', {
  beforeEach: function() {
    App = startApp();
  },
  afterEach: function() {
    Ember.run(App, 'destroy');
  }
});

test('has company', function() {
  var profile = make('profile', 'with_company');
  ok(profile.get('company.profile') === profile);
});