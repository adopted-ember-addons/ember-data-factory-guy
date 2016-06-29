import Ember from 'ember';
import FactoryGuy, { make }  from 'ember-data-factory-guy';
import hbs from 'htmlbars-inline-precompile';
import startApp from '../helpers/start-app';

import { test, moduleForComponent } from 'ember-qunit';

let App = null;

moduleForComponent('single-user', 'Integration | Component | single-user', {
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

  this.render(hbs`{{single-user user=user}}`);
  this.set('user', user);

  ok(this.$('.name').text().match(user.get('name')));
  ok(this.$('.funny-name').text().match(user.get('funnyName')));
});
