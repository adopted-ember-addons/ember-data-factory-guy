import FactoryGuy, { make, manualSetup }  from 'ember-data-factory-guy';
import hbs from 'htmlbars-inline-precompile';

import { test, moduleForComponent } from 'ember-qunit';

moduleForComponent('dude-translator', 'dude-translator manualSetup', {
  integration: true,

  beforeEach: function () {
    manualSetup(this.container);
  }
});


test("can translate original word", function () {
  let user = make('user', {name: 'Rob'});

  this.render(hbs`{{dude-translator original=name}}`);
  this.set('name', user.get('name'));

  ok(this.$('.translation').text() === 'Rob dude');
});
