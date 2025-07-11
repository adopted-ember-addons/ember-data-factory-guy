import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { mockFindAll, mockQuery } from 'ember-data-factory-guy';
import { inlineSetup } from '../../helpers/utility-methods';

module('RequestWrapper', function (hooks) {
  setupTest(hooks);
  inlineSetup(hooks, '-json-api');

  test('#getHandlers', function (assert) {
    let mockF = mockFindAll('user', 2),
      mockFQ = mockFindAll('user', 2).withParams({ foo: true }),
      mockQ = mockQuery('user', { moo: true }),
      wrapper = this.requestManager.findWrapper({ handler: mockF });

    assert.deepEqual(wrapper.getHandlers(), [mockFQ, mockQ, mockF]);
  });
});
