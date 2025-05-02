import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import FactoryGuy, {
  makeList,
  mockFindAll,
  setupFactoryGuy,
} from 'ember-data-factory-guy';
import { visit } from '@ember/test-helpers';

module('Acceptance | Profiles View', function (hooks) {
  setupApplicationTest(hooks);
  setupFactoryGuy(hooks);

  test('Handles differently cased attributes', async function (assert) {
    let description = 'mylittlepony',
      camelCaseDescription = 'myLittlePony',
      snake_case_description = 'my_little_pony';

    mockFindAll('profile', 1, {
      description,
      camelCaseDescription,
      snake_case_description,
    });

    await visit('/profiles');

    assert
      .dom('.profile:nth-child(1) [data-field=description]')
      .hasText(description);
    assert
      .dom('.profile:nth-child(1) [data-field=camelCaseDescription]')
      .hasText(camelCaseDescription);
    assert
      .dom('.profile:nth-child(1) [data-field=snake_case_description]')
      .hasText(snake_case_description);
  });

  test('Using FactoryGuy.cacheOnlyMode', async function (assert) {
    makeList('profile', 2);
    FactoryGuy.cacheOnlyMode();

    await visit('/profiles');

    assert.dom('.profile').exists({ count: 2 });
  });
});
