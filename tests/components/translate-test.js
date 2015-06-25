import Ember from 'ember';
import FactoryGuy, { make, clearStore }  from 'ember-data-factory-guy';
import TestHelper from 'ember-data-factory-guy/factory-guy-test-helper';
import startApp from '../helpers/start-app';

import { test, moduleForComponent } from 'ember-qunit';

var App = null;

moduleForComponent('translate', 'Translate', {
  unit: true,
  setup: function () {
    Ember.run(function () {
      App = startApp();
      TestHelper.setup();
    });
  },

  teardown: function () {
    Ember.run(function () {
      TestHelper.teardown();
      App.destroy();
    });
  }
});


test("can translate original word", function () {
  var component = this.subject();
  var user = make('user', {name: 'Rob'});
  component.set('original', user.get('name'));
  this.render();
  ok(find('.translation').text() === 'Rob dude');
});
