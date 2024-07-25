import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { setupFactoryGuy, make } from '@eflexsystems/ember-data-factory-guy';
import * as factories from 'dummy/tests/factories';

const modelType = 'profile';

module(`Unit | Model | ${modelType}`, function (hooks) {
  setupTest(hooks);
  setupFactoryGuy(hooks, factories);

  test('using only make for profile with company association', function (assert) {
    let profile = make('profile', 'with_company');
    assert.strictEqual(profile.company?.profile, profile);
  });

  test('composing a profile with a company association by making both', function (assert) {
    let company = make('company');
    let profile = make('profile', { company: company });
    assert.strictEqual(profile.company?.profile, profile);
  });

  test('uses customized transformFor', function (assert) {
    let profile = make('profile', { foo: 'bar' });
    assert.strictEqual(profile.foo, 'bar');
  });
});
