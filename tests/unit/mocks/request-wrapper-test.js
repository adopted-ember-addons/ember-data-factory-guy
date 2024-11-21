import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { mockFindAll, mockCreate } from 'ember-data-factory-guy';
import { inlineSetup } from '../../helpers/utility-methods';
import RequestManager from 'ember-data-factory-guy/mocks/request-manager';

const serializerType = '-json-api';

module('RequestWrapper', function (hooks) {
  setupTest(hooks);
  inlineSetup(hooks, serializerType);

  test('#getHandlers should prioritize handlers with match and query params', function (assert) {
    const withoutParams = mockCreate('user', 2);
    const withParams = mockCreate('user').withParams({ foo: true });
    const withSomeParams = mockCreate('user').withSomeParams({ foo: true });
    const withMatch = mockCreate('user').match({ foo: true });
    const wrapper = RequestManager.findWrapper({ handler: withoutParams });

    assert.deepEqual(wrapper.getHandlers(), [
      withMatch,
      withParams,
      withSomeParams,
      withoutParams,
    ]);
  });

  test('#getHandlers should prioritize newer handlers', function (assert) {
    const first = mockFindAll('user', 2);
    const second = mockFindAll('user', 2);
    const third = mockFindAll('user', 2);
    const wrapper = RequestManager.findWrapper({ handler: first });

    assert.deepEqual(wrapper.getHandlers(), [third, second, first]);
  });
});
