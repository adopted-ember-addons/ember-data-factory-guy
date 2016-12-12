import { manualSetup, make, makeList } from 'ember-data-factory-guy';
import { test, moduleForModel } from 'ember-qunit';

moduleForModel('profile', 'Unit | Model | profile', {
  needs: ['model:company', 'model:super-hero', 'model:group'],

  beforeEach: function() {
    manualSetup(this.container);
  }
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

test('using this.subject for profile and make for company association', function(assert) {
  let profile = this.subject({company: make('company')});
  assert.ok(profile.get('company.profile') === profile);
});

test('uses customized transformFor', function(assert) {
  let profile = make('profile', {foo: 'bar'});
  assert.equal(profile.get('foo'), 'bar');
});
