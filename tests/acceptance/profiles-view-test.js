import FactoryGuy, { makeList, mockFindAll } from 'ember-data-factory-guy';
import moduleForAcceptance from '../helpers/module-for-acceptance';

moduleForAcceptance('Acceptance | Profiles View');
// NOTE
// FactoryGuy before and after setup is in moduleForAcceptance helper

test("Handles differently cased attributes", function() {
  let description            = 'mylittlepony',
      camelCaseDescription   = "myLittlePony",
      snake_case_description = "my_little_pony";

  mockFindAll('profile', 1, { description, camelCaseDescription, snake_case_description });

  visit('/profiles');

  andThen(()=> {
    equal(find('.profile:first [data-field=description]').text(), description);
    equal(find('.profile:first [data-field=camelCaseDescription]').text(), camelCaseDescription);
    equal(find('.profile:first [data-field=snake_case_description]').text(), snake_case_description);
  });
});

test("Using FactoryGuy.cacheOnlyMode", function() {
  makeList("profile", 2);
  FactoryGuy.cacheOnlyMode();

  visit('/profiles');

  andThen(()=> {
    equal(find('.profile').length, 2);
  });
});
