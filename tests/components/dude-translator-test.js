import Ember from 'ember';
import FactoryGuy, { make }  from 'ember-data-factory-guy';
import hbs from 'htmlbars-inline-precompile';
import startApp from '../helpers/start-app';

import { test, moduleForComponent } from 'ember-qunit';

let App = null;

moduleForComponent('dude-translator', {
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
  let user = make('user', {name: 'Rob'});

  this.render(hbs`{{dude-translator original=name}}`);
  this.set('name', user.get('name'));
  ok(this.$('.translation').text() === 'Rob dude');
});
