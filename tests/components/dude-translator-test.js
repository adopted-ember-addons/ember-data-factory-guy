import Ember from 'ember';
import FactoryGuy, { make, manualSetup }  from 'ember-data-factory-guy';
import hbs from 'htmlbars-inline-precompile';
import startApp from '../helpers/start-app';

import { test, moduleForComponent } from 'ember-qunit';

var App = null;

moduleForComponent('user-list', {
//moduleForComponent('dude-translator', {
  integration: true,

  setup: function () {
    //console.log('setup',Ember.getOwner(this).lookup('service:store')+'');
    manualSetup(Ember.getOwner(this));
    //console.log(Ember.getOwner(this));
    //console.log(this.container)
    //Ember.run(function () {
    //App = startApp();
    //});
  },

  teardown: function () {
    Ember.run(FactoryGuy, 'clearStore');
    //Ember.run(App,'destroy');
  }
});


test("can translate original word", function () {
  var user = make('user', {name: 'Rob'});

  this.render(hbs`{{dude-translator original=name}}`);
  this.set('name', user.get('name'));
  ok(this.$('.translation').text() === 'Rob dude');
});
