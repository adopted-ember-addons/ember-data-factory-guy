import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { mockFindAll, mockQuery } from 'ember-data-factory-guy';
import { inlineSetup } from '../../helpers/utility-methods';
import RequestManager from 'ember-data-factory-guy/mocks/request-manager';

const serializerType = '-json-api';

module('RequestWrapper', function (hooks) {
  setupTest(hooks);
  inlineSetup(hooks, serializerType);

  test('#getHandlers', function (assert) {
    let mockF = mockFindAll('user', 2),
      mockFQ = mockFindAll('user', 2).withParams({ foo: true }),
      mockQ = mockQuery('user', { moo: true }),
      wrapper = RequestManager.findWrapper({ handler: mockF });

    assert.deepEqual(wrapper.getHandlers(), [mockFQ, mockQ, mockF]);
  });
});
