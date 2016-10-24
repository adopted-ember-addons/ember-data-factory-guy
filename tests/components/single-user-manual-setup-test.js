import { make, manualSetup }  from 'ember-data-factory-guy';
import hbs from 'htmlbars-inline-precompile';
import { test, moduleForComponent } from 'ember-qunit';

moduleForComponent('single-user', 'Integration | Component | single-user (manual setup)', {
  integration: true,

  beforeEach: function () {
    manualSetup(this.container);
  }
});

test("shows user information", function(assert) {
  let user = make('user', {name: 'Rob'});

  this.render(hbs`{{single-user user=user}}`);
  this.set('user', user);

  assert.ok(this.$('.name').text().match(user.get('name')));
  assert.ok(this.$('.funny-name').text().match(user.get('funnyName')));
});
