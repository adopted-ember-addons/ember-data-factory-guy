import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { mock, setupFactoryGuy, getPretender } from 'ember-data-factory-guy';
import Pretender from 'pretender';

module('Unit | getPretender', function (hooks) {
  setupTest(hooks);
  setupFactoryGuy(hooks);

  test('getPretender basic usage', function (assert) {
    let pretender = getPretender();

    assert.ok(
      pretender instanceof Pretender,
      'getPretender returns an instance of Pretender',
    );
    assert.strictEqual(
      pretender.handlers.length,
      0,
      'the handlers array is initially empty',
    );
    mock({ url: '/api/whatever' });
    assert.strictEqual(
      pretender.handlers.length,
      1,
      'the created mock is added to the handlers',
    );
  });
});
