import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { make, setupFactoryGuy } from 'ember-data-factory-guy';
import hbs from 'htmlbars-inline-precompile';

module(`Integration | Component | single-user (manual setup)`, function(hooks) {
  setupRenderingTest(hooks);
  setupFactoryGuy(hooks);

  test("shows user information", async function(assert) {
    let user = make('user', {name: 'Rob'});

    this.setProperties({user, createProject: () => {}});
    await this.render(hbs`{{single-user user=user createProject=createProject}}`);

    assert.ok(this.$('.name').text().match(user.get('name')));
    assert.ok(this.$('.funny-name').text().match(user.get('funnyName')));
  });
});
