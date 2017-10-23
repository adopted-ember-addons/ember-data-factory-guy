import {moduleFor, test} from 'ember-qunit';
import {mockFindAll, mockQuery} from 'ember-data-factory-guy';
import {inlineSetup} from '../../helpers/utility-methods';
import RequestManager from 'ember-data-factory-guy/mocks/request-manager';

const serializerType = '-json-api';

moduleFor('serializer:application', 'RequestWrapper', inlineSetup(serializerType));

test("#getHandlers", function(assert) {
  let mockF   = mockFindAll('user', 2),
      mockQ   = mockQuery('user'),
      wrapper = RequestManager.findWrapper({ handler: mockF });

  let tests = [
    [{}, {}, [mockF, mockQ], 'request (no params), mock (no params), keeps default sorting'],
    [{ name: 'Rob' }, {}, [mockQ, mockF], 'request (has params), mock (no params), sorts query first']
  ];

  for (let test of tests) {
    let [requestParams, mockParams, expected, message] = test;
    mockQ.withParams(mockParams);
    let request = { queryParams: requestParams };
    assert.deepEqual(wrapper.getHandlers(request), expected, message);
  }
});

