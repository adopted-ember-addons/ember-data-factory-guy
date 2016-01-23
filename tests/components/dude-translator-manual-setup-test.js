import Ember from 'ember';
import FactoryGuy, { make, manualSetup }  from 'ember-data-factory-guy';
import hbs from 'htmlbars-inline-precompile';

import { test, moduleForComponent } from 'ember-qunit';

moduleForComponent('dude-translator', 'dude-translator manualSetup', {
  integration: true,

  setup: function () {
    // you need ember 2.3 for this to work or the ember-getowner-polyfill installed
    manualSetup(Ember.getOwner(this));
  },

  teardown: function () {
    Ember.run(FactoryGuy, 'clearStore');
  }
});


test("can translate original word", function () {
  var user = make('user', {name: 'Rob'});

  this.render(hbs`{{dude-translator original=name}}`);
  this.set('name', user.get('name'));
  ok(this.$('.translation').text() === 'Rob dude');
});
