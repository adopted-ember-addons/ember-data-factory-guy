import {module, test} from 'qunit';
import {isEquivalent, isPartOf} from 'ember-data-factory-guy/utils/helper-functions';

module('isEquivalent | Helper Function');

let tomster = { name: 'Tomster', friends: ['Zoey', 'Yahuda', 'Tom'] };
let zoey = { name: 'Zoey', friends: ['Tomster', 'Yahuda', 'Tom'] };
let daniel = { name: 'Daniel', friends: ['Zoey', 'Yahuda', 'Tom'] };

test('#isEquivalent with numbers', function(assert) {
  assert.ok(isEquivalent(1, 1), 'Equivalent numbers should return true');

  assert.ok(!isEquivalent(1, 2), 'Non-equivalent numbers should return false');
  assert.ok(!isEquivalent(1, '1'), 'Non-equivalent values should return false');
});

test('#isEquivalent with strings', function(assert) {
  assert.ok(isEquivalent(tomster.name, 'Tomster'), 'Equivalent strings should return true');

  assert.ok(!isEquivalent(zoey.name, 'Tomster'), 'Non-equivalent strings should return false');
});

test('#isEquivalent with booleans', function(assert) {
  assert.ok(isEquivalent(true, true), 'true === true');
  assert.ok(isEquivalent(false, false), 'false === false');

  assert.ok(!isEquivalent(true, false), 'true !== false');
  assert.ok(!isEquivalent(true, 1), 'true !== 1');
  assert.ok(!isEquivalent(true, 'true'), 'true !== 1');
});

test('#isEquivalent with arrays', function(assert) {
  assert.ok(isEquivalent(tomster.friends, daniel.friends), 'arrays with equivalent contents in the same order return true');

  assert.ok(!isEquivalent(tomster.friends, zoey.friends), 'arrays with non-equivalent contents return false');
  assert.ok(!isEquivalent(tomster.friends, ['Zoey', 'Tom', 'Yahuda']), 'arrays with equivalent contents but in a different order return false');

  assert.ok(isEquivalent([
      1,
      [
        'a',
        [true]
      ]
    ],
    [
      1,
      [
        'a',
        [true]
      ]
    ]), 'matches equivalence on deeply nested arrays');

  assert.ok(!isEquivalent([
      1,
      [
        'a',
        [true]
      ]
    ],
    [
      1,
      [
        'b',
        [true]
      ]
    ]), 'filters equivalence on deeply nested arrays');
});

test('#isEquivalent with objects', function(assert) {
  assert.ok(isEquivalent(tomster, {
    name: 'Tomster',
    friends: ['Zoey', 'Yahuda', 'Tom']
  }), 'returns true if object key-value pairs are equivalent');

  assert.ok(!isEquivalent(tomster, zoey), 'returns false if object key-value pairs are not equivalent');

  assert.ok(!isEquivalent(tomster, {
    name: 'Tomster',
    friends: ['Zoey', 'Daniel', 'Tom']
  }), 'returns false if object key-value pairs are not equivalent');
});

test('#isEquivalent with deeply nested objects', function(assert) {
  // we don't use nestedTomster or nestedZoey in the friends array to avoid
  // infinite recursion

  let nestedTomster = {
    name: tomster.name,
    friends: [zoey, daniel]
  };

  let nestedZoey = {
    name: zoey.name,
    friends: [tomster, daniel]
  };

  assert.ok(isEquivalent(nestedTomster, {
    name: tomster.name,
    friends: [zoey, daniel]
  }), 'returns true if object key-value pairs are equivalent');

  assert.ok(!isEquivalent(nestedZoey, nestedTomster), 'returns false if object key-value pairs are not equivalent');
});

test('#isPartOf', function(assert) {
  assert.ok(isPartOf(tomster, { name: 'Tomster' }),
    'returns true if the first object contains all key-value pairs from the second object');

  assert.ok(isPartOf(tomster, tomster),
    'returns true if the first object is the same as the second object');

  assert.ok(isPartOf(tomster, {}),
    'returns true if the second object is empty');

  assert.notOk(isPartOf(tomster, { name: 'Tomster', number: 1 }),
    'returns false if the first object does not contains key-value pairs from the second object');
});
