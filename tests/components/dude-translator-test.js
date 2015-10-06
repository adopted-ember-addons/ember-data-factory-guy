import Ember from 'ember';
import FactoryGuy, { make, clearStore }  from 'ember-data-factory-guy';
import TestHelper from 'ember-data-factory-guy/factory-guy-test-helper';
import hbs from 'htmlbars-inline-precompile';
import startApp from '../../helpers/start-app';

import { test, moduleForComponent } from 'ember-qunit';

var App = null;

moduleForComponent('user-list', {
  integration: true,

  setup: function () {
    Ember.run(function () {
      App = startApp();
    });
  },

  teardown: function () {
    Ember.run(App,'destroy');
  }
});


test("can translate original word", function () {
  var user = make('user', {name: 'Rob'});

  this.render(hbs`{{dude-translator original=name}}`);
  this.set('name', user.get('name'));

  ok(this.$('.translation').text() === 'Rob dude');
});
