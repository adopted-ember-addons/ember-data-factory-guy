import {module, test} from 'qunit';
import FactoryGuy, { makeList, mockFindAll } from 'ember-data-factory-guy';
import moduleForAcceptance from '../helpers/module-for-acceptance';

moduleForAcceptance('Acceptance | Profiles View');
// NOTE
// FactoryGuy before and after setup is in moduleForAcceptance helper

test("Handles differently cased attributes", function(assert) {
  let description            = 'mylittlepony',
      camelCaseDescription   = "myLittlePony",
      snake_case_description = "my_little_pony";

  mockFindAll('profile', 1, { description, camelCaseDescription, snake_case_description });

  visit('/profiles');

  andThen(()=> {
    assert.equal(find('.profile:first [data-field=description]').text(), description);
    assert.equal(find('.profile:first [data-field=camelCaseDescription]').text(), camelCaseDescription);
    assert.equal(find('.profile:first [data-field=snake_case_description]').text(), snake_case_description);
  });
});

test("Using FactoryGuy.cacheOnlyMode", function(assert) {
  makeList("profile", 2);
  FactoryGuy.cacheOnlyMode();

  visit('/profiles');

  andThen(()=> {
    assert.equal(find('.profile').length, 2);
  });
});
