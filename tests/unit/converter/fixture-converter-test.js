import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { build } from 'ember-data-factory-guy';
import { inlineSetup } from '../../helpers/utility-methods';

module('FixtureConverter', function(hooks) {
  setupTest(hooks);
  inlineSetup(hooks, '-rest');

  test("#getTransformKeyFunction with custom serializer keyForAttribute function", function(assert) {
    let buildJson = build('manager');
    buildJson.unwrap();

    let expectedJson = {
      manager: {
        id: 1,
        name: {
          first_name: 'Tyrion',
          last_name: 'Lannister'
        }
      }
    };

    assert.deepEqual(buildJson, expectedJson);
  });
});
