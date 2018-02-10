import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { manualSetup, make } from 'ember-data-factory-guy';

const modelType = 'profile';

module(`Unit | Model | ${modelType}`, function(hooks) {
  setupTest(hooks);

  hooks.beforeEach(function() {
    manualSetup(this);
  });

  test('using only make for profile with company association', function(assert) {
    let profile = make('profile', 'with_company');
    assert.ok(profile.get('company.profile') === profile);
  });

  test('composing a profile with a company association by making both', function(assert) {
    let company = make('company');
    let profile = make('profile', {company: company});
    assert.ok(profile.get('company.profile') === profile);
  });

  test('uses customized transformFor', function(assert) {
    let profile = make('profile', {foo: 'bar'});
    assert.equal(profile.get('foo'), 'bar');
  });
});
