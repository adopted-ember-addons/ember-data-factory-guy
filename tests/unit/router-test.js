import { manualSetup, mockFindAll } from 'ember-data-factory-guy';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | forgetting to needs transform', function (hooks) {
  setupTest(hooks);

  hooks.beforeEach(function () {
    manualSetup(this.container);
  });

  test('profiles', function (assert) {
    let regex = new RegExp(
      '\\[ember-data-factory-guy\\] could not find\\s*the \\[ just-a-string \\] transform'
    );
    assert.throws(
      () => mockFindAll('profile', 2),
      regex,
      'factory guy produces a nice error message when you forget to needs a transform'
    );
  });
});
