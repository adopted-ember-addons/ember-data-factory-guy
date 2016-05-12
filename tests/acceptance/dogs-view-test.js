import FactoryGuy, { makeList, mockFindAll } from 'ember-data-factory-guy';
import moduleForAcceptance from '../helpers/module-for-acceptance';

moduleForAcceptance('Acceptance | Dogs View');
// NOTE
// FactoryGuy before and after setup is in moduleForAcceptance helper

test("Handles primaryKey other than id", function() {
  let name = 'Bandit';

  mockFindAll('dog', 2, {name: name});
  visit('/dogs');

  andThen(()=> {
    equal(find('.dog:first [data-field=name]').text(), name);
  });
});

test("Using FactoryGuy.cacheOnlyMode", function() {
  makeList("dog", 2);
  FactoryGuy.cacheOnlyMode();

  visit('/dogs');

  andThen(()=> {
    equal(find('.dog').length, 2);
  });
});
