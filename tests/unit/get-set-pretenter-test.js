import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { mock, manualSetup, getPretender, setPretender } from 'ember-data-factory-guy';
import Pretender from 'pretender'

module('Unit | getPretender and setPretender', function(hooks) {
  setupTest(hooks);

  hooks.beforeEach(function() {
    manualSetup(this);
  });

  test('getPretender basic usage', function(assert) {
    assert.expect(3);
    let pretender = getPretender();

    assert.ok(pretender instanceof Pretender, "getPretender returns an instance of Pretender");
    assert.equal(pretender.handlers.length, 0, "the handlers array is initially empty");
    mock({url: "/api/whatever"});
    assert.equal(pretender.handlers.length, 1, "the created mock is added to the handlers");
  });

  test('setPretender basic usage', function(assert) {
    assert.expect(1);
    let pretender = new Pretender();
    setPretender(pretender);
    assert.equal(pretender, getPretender(), "getPretender points to the instance passed to setPretender");
  });

  test('setPretender throws if Pretender is already instantiated', function(assert) {
    assert.expect(1);
    let pretender = getPretender();
    assert.throws(
      function() {
        setPretender(pretender);
      },
      function(err) {
        return err.toString().includes("[ember-data-factory-guy] Pretender is already instantiated. Call setPretender before adding mocks.");
      }
    );
  });

  test('setPretender throws if its argument is not an instance of Pretender', function(assert) {
    assert.expect(1);
    assert.throws(
      function() {
        setPretender({something: "arbitrary"});
      },
      function(err) {
        return err.toString().includes("[ember-data-factory-guy] You must pass an instance of Pretender as an argument to setPretender.");
      }
    );
  });
});
