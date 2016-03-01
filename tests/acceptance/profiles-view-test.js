import { mockFindAll } from 'ember-data-factory-guy';
import moduleForAcceptance from '../helpers/module-for-acceptance';

moduleForAcceptance('Acceptance | Profiles View');
// NOTE
// FactoryGuy before and after setup is in moduleForAcceptance helper

test("Handles differently cased attributes", function () {

  mockFindAll('profile', 2);
  visit('/profiles');

  andThen(()=> {
    equal(find('.profile:first [data-field=description]').text(), 'Text goes here');
    equal(find('.profile:first [data-field=camelCaseDescription]').text(), 'textGoesHere');
    equal(find('.profile:first [data-field=snake_case_description]').text(), 'text_goes_here');
  });
});
