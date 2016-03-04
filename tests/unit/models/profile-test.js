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


moduleForModel('profile', 'Unit | Model | profile with no FactoryGuy setup', {
  needs: ['model:company'],

  beforeEach: function() {
    // ooops ..forgot to setup FactoryGuy with manualSetup(this.container)
  }
});

test('make throws excpetion because there is NO store setup', function(assert) {
  assert.throws(function() {
    make('profile');
  },
    /FactoryGuy does not have the application's store/
  );
});

test('makeList throws excpetion because there is NO store setup', function(assert) {
  assert.throws(function() {
    makeList('profile');
  },
    /FactoryGuy does not have the application's store/
  );
});

