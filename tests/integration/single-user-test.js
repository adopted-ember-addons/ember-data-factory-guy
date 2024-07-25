import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { make, setupFactoryGuy } from '@eflexsystems/ember-data-factory-guy';
import hbs from 'htmlbars-inline-precompile';
import * as factories from 'dummy/tests/factories';

module(
  `Integration | Component | single-user (manual setup)`,
  function (hooks) {
    setupRenderingTest(hooks);
    setupFactoryGuy(hooks, factories);

    test('shows user information', async function (assert) {
      let user = make('user', { name: 'Rob' });

      this.setProperties({
        user,
        createProject: () => {},
        onSetProjectTitle: () => {},
      });
      await render(
        hbs`<SingleUser @user={{this.user}} @createProject={{this.createProject}} @onSetProjectTitle={{this.onSetProjectTitle}} />`,
      );

      assert.dom('.name').containsText(user.name);
      assert.dom('.funny-name').containsText(user.funnyName);
    });
  },
);
