import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { make } from 'ember-data-factory-guy';
import { inlineSetup } from '../../helpers/utility-methods';

module(`Unit | Model | profile`, function (hooks) {
  setupTest(hooks);
  inlineSetup(hooks, '-json-api');

  test('using only make for profile with company association', function (assert) {
    let profile = make('profile', 'with_company');
    assert.strictEqual(profile.get('company.profile'), profile);
  });

  test('composing a profile with a company association by making both', function (assert) {
    let company = make('company');
    let profile = make('profile', { company: company });
    assert.strictEqual(profile.get('company.profile'), profile);
  });

  test('uses customized transformFor', function (assert) {
    let profile = make('profile', { foo: 'bar' });
    assert.strictEqual(profile.get('foo'), 'bar');
  });
});
