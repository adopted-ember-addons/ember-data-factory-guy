import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { make } from 'ember-data-factory-guy';
import { inlineSetup } from '../helpers/utility-methods';
import SingleUser from 'test-app/components/single-user';

module(
  `Integration | Component | single-user (manual setup)`,
  function (hooks) {
    setupRenderingTest(hooks);
    inlineSetup(hooks, '-json-api');

    test('shows user information', async function (assert) {
      const user = make('user', { name: 'Rob' });
      const createProject = () => {};

      await render(
        <template>
          <SingleUser @user={{user}} @createProject={{createProject}} />
        </template>,
      );

      assert.dom('.name').containsText(user.get('name'));
      assert.dom('.funny-name').containsText(user.get('funnyName'));
    });
  },
);
