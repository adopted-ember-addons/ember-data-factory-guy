import FactoryGuy, { makeList, mockFindAll } from 'ember-data-factory-guy';
import moduleForAcceptance from '../helpers/module-for-acceptance';

moduleForAcceptance('Acceptance | Cats View');
// NOTE
// FactoryGuy before and after setup is in moduleForAcceptance helper

test("Handles primaryKey other than id", function() {
  let name = 'Felix';

  mockFindAll('cat', 2, {name: name});

  visit('/cats');

  andThen(()=> {
    equal(find('.cat:first [data-field=name]').text(), name);
  });
});

test("Using FactoryGuy.cacheOnlyMode", function() {
  makeList("cat", 2);
  FactoryGuy.cacheOnlyMode();

  visit('/cats');

  andThen(()=> {
    equal(find('.cat').length, 2);
  });
});
