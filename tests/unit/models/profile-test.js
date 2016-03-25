import { manualSetup, make, makeList } from 'ember-data-factory-guy';
import { test, moduleForModel } from 'ember-qunit';

moduleForModel('profile', 'Unit | Model | profile', {
  needs: ['model:company', 'model:super-hero', 'model:group'],

  beforeEach: function() {
    manualSetup(this.container);
  }
});

test('using only make for profile with company association', function() {
  let profile = make('profile', 'with_company');
  ok(profile.get('company.profile') === profile);
});

test('composing a profile with a company association by making both', function() {
  let company = make('company');
  let profile = make('profile', {company: company});
  ok(profile.get('company.profile') === profile);
});

test('using this.subject for profile and make for company associaion', function() {
  let profile = this.subject({company: make('company')});
  ok(profile.get('company.profile') === profile);
});

test('uses customized transformFor', function () {
  let profile = make('profile', {foo: 'bar'});
  equal(profile.get('foo'), 'bar');
});
