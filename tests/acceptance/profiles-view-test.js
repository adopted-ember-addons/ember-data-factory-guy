import fgHelper from 'ember-data-factory-guy/factory-guy-test-helper';
import moduleForAcceptance from '../helpers/module-for-acceptance';

moduleForAcceptance('Acceptance | Profiles View', {
  beforeEach: function () {
    fgHelper.setup();
  },
  afterEach: function () {
    fgHelper.teardown();
  }
});


test("Handles differently cased attributes", function () {

  fgHelper.handleFindAll('profile', 2);
  visit('/profiles');

  andThen(function () {
    equal(find('.profile:first [data-field=description]').text(), 'Text goes here');
    equal(find('.profile:first [data-field=camelCaseDescription]').text(), 'textGoesHere');
    equal(find('.profile:first [data-field=snake_case_description]').text(), 'text_goes_here');
  });
});
