import { manualSetup, make } from 'ember-data-factory-guy';
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

test('using this.subject for profile and make for company associaion', function() {
  let profile = this.subject({company: make('company')});
  ok(profile.get('company.profile') === profile);
});