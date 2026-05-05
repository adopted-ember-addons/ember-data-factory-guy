import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { RequestManagerPretender } from 'ember-data-factory-guy';

const fakePretender = {
  get: () => {},
  post: () => {},
  put: () => {},
  patch: () => {},
  delete: () => {},
  head: () => {},
  shutdown: () => {},
};

module('RequestManagerPretender', function (hooks) {
  setupTest(hooks);

  module('#settings', function () {
    test('does not throw when called', function (assert) {
      const rm = new RequestManagerPretender(fakePretender);
      rm.settings({ delay: 50 });
      assert.ok(true, 'settings call completed without error');
    });

    test('passes delay through to internal settings', function (assert) {
      const rm = new RequestManagerPretender(fakePretender);
      rm.settings({ delay: 100 });
      assert.strictEqual(rm._settings.delay, 100);
    });

    test('maps responseTime to delay', function (assert) {
      const rm = new RequestManagerPretender(fakePretender);
      rm.settings({ responseTime: 200 });
      assert.strictEqual(rm._settings.delay, 200);
    });
  });
});
