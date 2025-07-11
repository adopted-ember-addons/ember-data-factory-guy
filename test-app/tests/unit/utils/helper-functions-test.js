import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import {
  isEmptyObject,
  isEquivalent,
  parseUrl,
} from 'ember-data-factory-guy/-private';

module('Unit | Helper Functions', function (hooks) {
  setupTest(hooks);

  test('#isEmptyObject', function (assert) {
    assert.expect(5);
    let tests = [
      [null, true, 'null'],
      [undefined, true, 'undefined'],
      [[], true, '[]'],
      [{}, true, '{}'],
      [{ a: 1 }, false, '{a:1}'],
    ];

    for (let test of tests) {
      let [object, expected, message] = test;
      assert.strictEqual(isEmptyObject(object), expected, message);
    }
  });

  let tomster = { name: 'Tomster', friends: ['Zoey', 'Yahuda', 'Tom'] };
  let zoey = { name: 'Zoey', friends: ['Tomster', 'Yahuda', 'Tom'] };
  let daniel = { name: 'Daniel', friends: ['Zoey', 'Yahuda', 'Tom'] };

  test('#isEquivalent with numbers', function (assert) {
    assert.ok(isEquivalent(1, 1), 'Equivalent numbers should return true');

    assert.notOk(
      isEquivalent(1, 2),
      'Non-equivalent numbers should return false',
    );
    assert.notOk(
      isEquivalent(1, '1'),
      'Non-equivalent values should return false',
    );
  });

  test('#isEquivalent with strings', function (assert) {
    assert.ok(
      isEquivalent(tomster.name, 'Tomster'),
      'Equivalent strings should return true',
    );

    assert.notOk(
      isEquivalent(zoey.name, 'Tomster'),
      'Non-equivalent strings should return false',
    );
  });

  test('#isEquivalent with booleans', function (assert) {
    assert.ok(isEquivalent(true, true), 'true === true');
    assert.ok(isEquivalent(false, false), 'false === false');

    assert.notOk(isEquivalent(true, false), 'true !== false');
    assert.notOk(isEquivalent(true, 1), 'true !== 1');
    assert.notOk(isEquivalent(true, 'true'), 'true !== 1');
  });

  test('#isEquivalent with arrays', function (assert) {
    assert.ok(
      isEquivalent(tomster.friends, daniel.friends),
      'arrays with equivalent contents in the same order return true',
    );

    assert.notOk(
      isEquivalent(tomster.friends, zoey.friends),
      'arrays with non-equivalent contents return false',
    );
    assert.notOk(
      isEquivalent(tomster.friends, ['Zoey', 'Tom', 'Yahuda']),
      'arrays with equivalent contents but in a different order return false',
    );

    assert.ok(
      isEquivalent([1, ['a', [true]]], [1, ['a', [true]]]),
      'matches equivalence on deeply nested arrays',
    );

    assert.notOk(
      isEquivalent([1, ['a', [true]]], [1, ['b', [true]]]),
      'filters equivalence on deeply nested arrays',
    );
  });

  test('#isEquivalent with objects', function (assert) {
    assert.ok(
      isEquivalent(tomster, {
        name: 'Tomster',
        friends: ['Zoey', 'Yahuda', 'Tom'],
      }),
      'returns true if object key-value pairs are equivalent',
    );

    assert.notOk(
      isEquivalent(tomster, zoey),
      'returns false if object key-value pairs are not equivalent',
    );

    assert.notOk(
      isEquivalent(tomster, {
        name: 'Tomster',
        friends: ['Zoey', 'Daniel', 'Tom'],
      }),
      'returns false if object key-value pairs are not equivalent',
    );
  });

  test('#isEquivalent with deeply nested objects', function (assert) {
    // we don't use nestedTomster or nestedZoey in the friends array to avoid
    // infinite recursion

    let nestedTomster = {
      name: tomster.name,
      friends: [zoey, daniel],
    };

    let nestedZoey = {
      name: zoey.name,
      friends: [tomster, daniel],
    };

    assert.ok(
      isEquivalent(nestedTomster, {
        name: tomster.name,
        friends: [zoey, daniel],
      }),
      'returns true if object key-value pairs are equivalent',
    );

    assert.notOk(
      isEquivalent(nestedZoey, nestedTomster),
      'returns false if object key-value pairs are not equivalent',
    );
  });

  test('parseUrl', function (assert) {
    assert.expect(8);
    let tests = [
      ['', ['', {}]],
      [null, ['', {}]],
      ['/fee', ['/fee', {}]],
      ['/fee?fi=fo', ['/fee', { fi: 'fo' }]],
    ];

    for (let test of tests) {
      let [url, expected] = test;
      const [expectedUrl, expectedParams] = expected,
        [actualUrl, actualParams] = parseUrl(url);

      assert.strictEqual(
        actualUrl,
        expectedUrl,
        `${actualUrl} expect url => ${expectedUrl}`,
      );
      assert.deepEqual(
        actualParams,
        expectedParams,
        `${actualParams} expect params => ${expectedParams}`,
      );
    }
  });
});
