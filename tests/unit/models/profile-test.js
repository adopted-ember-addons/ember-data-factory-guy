import Ember from 'ember';
import FactoryGuy, { make } from 'ember-data-factory-guy';
import startApp from '../../helpers/start-app';

let App = null;

module('Profile Model', {
  beforeEach: function() {
    App = startApp();
  },
  afterEach: function() {
    Ember.run(App, 'destroy');
  }
});

test('has company', function() {
  let profile = make('profile', 'with_company');
  ok(profile.get('company.profile') === profile);
});