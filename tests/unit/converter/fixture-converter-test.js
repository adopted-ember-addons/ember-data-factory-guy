import {moduleFor, test} from 'ember-qunit';
import {make, makeList, build, buildList} from 'ember-data-factory-guy';

import {inlineSetup} from '../../helpers/utility-methods';

moduleFor('serializer:application', 'FixtureConverter', inlineSetup('-rest'));

test("#getTransformKeyFunction with custom serializer keyForAttribute function", function(assert) {
  let buildJson = build('manager');
  buildJson.unwrap();

  let expectedJson = {
    manager: {
      id: 1,
      name: {
        firstName: 'Tyrion',
        lastName: 'Lannister'
      }
    }
  };

  assert.deepEqual(buildJson, expectedJson);
});
