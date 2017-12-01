import {test} from 'qunit';
import {make, mockFindAll} from 'ember-data-factory-guy';
import moduleForAcceptance from '../helpers/module-for-acceptance';

moduleForAcceptance('Acceptance | Cat View');

function assertCatIsCute(cat, assert) {
  assert.equal('Cute', cat.get('type'));
}

test('cat type does not change', function(assert) {
  const cat = make('cat');
  assertCatIsCute(cat, assert); // make is fine

  mockFindAll('cat').returns({
    models: [cat],
  });
  assertCatIsCute(cat, assert); // Mocked payload hasn't yet been pushed to store

  // Having some kind of button would make a nicer test
  const store = this.application.__container__.lookup('service:store');
  assertCatIsCute(cat, assert); // Mocked payload hasn't yet been pushed to store
  store.findAll('cat') // Triggering the request
  visit('/') // Doing something so that the app and the run loop and maybe other things do run
  andThen(() => {
    assertCatIsCute(cat, assert); // This should not fail, but it does
  });
});
