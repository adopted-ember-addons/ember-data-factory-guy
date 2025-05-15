import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { make } from 'ember-data-factory-guy';
import hbs from 'htmlbars-inline-precompile';
import { inlineSetup } from '../helpers/utility-methods';

module(
  `Integration | Component | single-user (manual setup)`,
  function (hooks) {
    setupRenderingTest(hooks);
    inlineSetup(hooks, '-json-api');

    test('shows user information', async function (assert) {
      let user = make('user', { name: 'Rob' });

      this.setProperties({ user, createProject: () => {} });
      await render(
        hbs`<SingleUser @user={{this.user}} @createProject={{this.createProject}} />`,
      );

      assert.dom('.name').containsText(user.get('name'));
      assert.dom('.funny-name').containsText(user.get('funnyName'));
    });
  },
);
