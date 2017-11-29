import {moduleFor, test} from 'ember-qunit';
import {build} from 'ember-data-factory-guy';

import {inlineSetup} from '../../helpers/utility-methods';

moduleFor('serializer:application', 'FixtureConverter', inlineSetup('-rest'));

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
