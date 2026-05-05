import { module, test } from 'qunit';
import { Sequence } from 'ember-data-factory-guy/-private';

module('Sequence', function () {
  test('is a class (has a name)', function (assert) {
    const seq = new Sequence((n) => n);
    assert.strictEqual(seq.constructor.name, 'Sequence');
  });

  test('calls fn with incrementing index starting at 1', function (assert) {
    const received = [];
    const seq = new Sequence((n) => {
      received.push(n);
      return n * 10;
    });

    assert.strictEqual(seq.next(), 10);
    assert.strictEqual(seq.next(), 20);
    assert.strictEqual(seq.next(), 30);
    assert.deepEqual(received, [1, 2, 3]);
  });

  test('does not bind this to the Sequence instance inside fn', function (assert) {
    let capturedThis;
    const seq = new Sequence(function (n) {
      capturedThis = this;
      return n;
    });
    seq.next();
    assert.notStrictEqual(
      capturedThis,
      seq,
      'fn should not receive Sequence as this',
    );
  });

  test('reset restarts index at 1', function (assert) {
    const seq = new Sequence((n) => n);
    seq.next();
    seq.next();
    seq.reset();
    assert.strictEqual(seq.next(), 1);
  });
});
