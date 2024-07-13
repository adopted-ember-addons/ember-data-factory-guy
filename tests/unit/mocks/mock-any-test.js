import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { mock } from 'ember-data-factory-guy';
import { fetchJSON, inlineSetup } from '../../helpers/utility-methods';

const serializerType = '-json-api';

module('MockAny', function (hooks) {
  setupTest(hooks);
  inlineSetup(hooks, serializerType);

  test('with incorrect parameters', function (assert) {
    assert.throws(function () {
      mock({ url: null });
    }, 'missing url');
  });

  test('defaults values for type, status', function (assert) {
    let mockAny = mock({ url: '/meep-meep' });

    assert.strictEqual(mockAny.getType(), 'GET');
    assert.strictEqual(mockAny.status, 200);
  });

  test('status option', async function (assert) {
    let status = 422;
    let url = '/api/v2/sessions';
    let method = 'POST';
    let responseText = { errors: { login: 'invalid login or password' } };
    let mockAny = mock({
      type: method,
      url: url,
      responseText: responseText,
      status: status,
    });

    assert.strictEqual(mockAny.status, status);
    const json = await fetchJSON({ url, method });

    assert.deepEqual(json, responseText);
  });

  test('GET', async function (assert) {
    const method = 'GET',
      url = '/api/get-stuff',
      responseText = { what: 'up' };

    mock({ url, type: method, responseText });

    const json = await fetchJSON({ url, method });

    assert.deepEqual(json, responseText);
  });

  test('PUT', async function (assert) {
    const method = 'PUT',
      url = '/api/put-stuff',
      responseText = { what: 'up' };

    mock({ url, type: method, responseText });
    let json = await fetchJSON({ url, method });

    assert.deepEqual(json, responseText);
  });

  test('PUT with body params', async function (assert) {
    const method = 'PUT',
      url = '/api/post-stuff',
      whatsUp = { whats: 'up' },
      whatsUpDoc = { whats: 'up doc' };

    let theMock = mock({ url, type: method })
        .withParams(whatsUp)
        .returns(whatsUp),
      json = await fetchJSON({ url, params: whatsUp, method });

    assert.deepEqual(json, whatsUp, 'returns json for url with params #1');

    theMock.withParams(whatsUpDoc).returns(whatsUpDoc);
    json = await fetchJSON({ url, params: whatsUpDoc, method });

    assert.deepEqual(
      json,
      whatsUpDoc,
      'returns json for url matching params #2'
    );
  });

  test('PATCH with body params', async function (assert) {
    const method = 'PATCH',
      url = '/api/post-stuff',
      whatsUp = { whats: 'up' },
      whatsUpDoc = { whats: 'up doc' };

    let theMock = mock({ url, type: method })
        .withParams(whatsUp)
        .returns(whatsUp),
      json = await fetchJSON({ url, params: whatsUp, method });

    assert.deepEqual(json, whatsUp, 'returns json for url with params #1');

    theMock.withParams(whatsUpDoc).returns(whatsUpDoc);
    json = await fetchJSON({ url, params: whatsUpDoc, method });

    assert.deepEqual(
      json,
      whatsUpDoc,
      'returns json for url matching params #2'
    );
  });

  test('returns', async function (assert) {
    const method = 'GET',
      url = '/api/get-stuff',
      whatsUp = { whats: 'up' },
      whatsUpDoc = { whats: 'up doc' };

    let theMock = mock({ url }).returns(whatsUp);

    let json = await fetchJSON({ url, method });
    assert.deepEqual(json, whatsUp, 'returns json that is set');

    theMock.returns(whatsUpDoc);
    json = await fetchJSON({ url, method });

    assert.deepEqual(json, whatsUpDoc, 'returns next json that is set');
  });

  test('GET with url params', async function (assert) {
    const method = 'GET',
      url = '/api/get-stuff',
      whatsUp = {
        whats: 'up',
        dudes: [1],
        dude: 1,
        awake: true,
        keys: { e: 1 },
      },
      whatsUpDoc = { whats: 'up doc' };

    let theMock = mock({ url }).withParams(whatsUp).returns(whatsUp);

    let json = await fetchJSON({ url, params: whatsUp, method });
    assert.deepEqual(json, whatsUp, 'returns json for url with params #1');

    theMock.withParams(whatsUpDoc).returns(whatsUpDoc);

    json = await fetchJSON({ url, params: whatsUpDoc, method });
    assert.deepEqual(
      json,
      whatsUpDoc,
      'returns json for url matching params #2'
    );
  });

  test('POST', async function (assert) {
    const method = 'POST',
      url = '/api/post-stuff',
      data = { whats: 'up' },
      responseText = { dude: 'dude' };

    mock({ url, type: method, data }).returns(responseText);
    const json = await fetchJSON({ url, params: data, method });

    assert.deepEqual(json, responseText, 'returns json for url with params #1');
  });

  test('POST with body params', async function (assert) {
    const method = 'POST',
      url = '/api/post-stuff',
      whatsUp = { whats: 'up' },
      whatsUpDoc = { whats: 'up doc' };

    let theMock = mock({ url, type: method })
        .withParams(whatsUp)
        .returns(whatsUp),
      json = await fetchJSON({ url, params: whatsUp, method });

    assert.deepEqual(json, whatsUp, 'returns json for url with params #1');

    theMock.withParams(whatsUpDoc).returns(whatsUpDoc);
    json = await fetchJSON({ url, params: whatsUpDoc, method });

    assert.deepEqual(
      json,
      whatsUpDoc,
      'returns json for url matching params #2'
    );
  });

  test('mock#timesCalled works as expected', async function (assert) {
    const method = 'POST',
      url = '/api/post-stuff';

    let theMock = mock({ url, type: method });
    assert.strictEqual(
      theMock.timesCalled,
      0,
      'mock#timesCalled is initially 0'
    );

    await fetchJSON({ url, method });
    assert.strictEqual(
      theMock.timesCalled,
      1,
      'mock#timesCalled is called once'
    );
  });

  test('Star segments work', async function (assert) {
    const method = 'POST',
      url = '/api/post/some-stuff';

    let theMock = mock({ url: '/api/*/some-stuff', type: method });
    assert.strictEqual(
      theMock.timesCalled,
      0,
      'mock#timesCalled is initially 0'
    );

    await fetchJSON({ url, method });
    assert.strictEqual(
      theMock.timesCalled,
      1,
      'mock#timesCalled is called once'
    );
  });

  function testWithSomeParamsForMethod(method) {
    test(`#withSomeParams works with complex parameters for ${method} requests`, async function (assert) {
      const url = '/api/post/some-stuff',
        dataFoo = {
          foo: 'foo',
          array: ['a', { b: 123 }, 'c'],
          obj: { a: 321 },
        },
        dataBar = { bar: 'bar', array: [1, { x: 2 }, 3], obj: { x: 321 } };

      let fooMock = mock({ url, type: method }).withSomeParams(dataFoo);
      let barMock = mock({ url, type: method }).withSomeParams(dataBar);
      assert.strictEqual(
        fooMock.timesCalled,
        0,
        'fooMock#timesCalled is initially 0'
      );
      assert.strictEqual(
        barMock.timesCalled,
        0,
        'barMock#timesCalled is initially 0'
      );

      await fetchJSON({
        url,
        method,
        params: Object.assign({ extra: 123 }, dataFoo),
      });
      assert.strictEqual(
        fooMock.timesCalled,
        1,
        'fooMock#timesCalled is called once'
      );
      assert.strictEqual(
        barMock.timesCalled,
        0,
        'barMock#timesCalled is called once'
      );

      await fetchJSON({
        url,
        method,
        params: Object.assign({ extra: 123 }, dataBar),
      });
      assert.strictEqual(
        fooMock.timesCalled,
        1,
        'fooMock#timesCalled is called once'
      );
      assert.strictEqual(
        barMock.timesCalled,
        1,
        'barMock#timesCalled is called once'
      );
    });
  }

  ['GET', 'POST', 'PATCH', 'PUT'].forEach(testWithSomeParamsForMethod);

  function testWithParamsForMethod(method) {
    test(`#withParams works with complex parameters for ${method} requests`, async function (assert) {
      const url = '/api/post/some-stuff',
        dataFoo = {
          foo: 'foo',
          array: ['a', { b: 123 }, 'c'],
          obj: { a: 321 },
        },
        dataBar = { bar: 'bar', array: [1, { x: 2 }, 3], obj: { x: 321 } };

      let fooMock = mock({ url, type: method }).withParams(dataFoo);
      let barMock = mock({ url, type: method }).withParams(dataBar);
      assert.strictEqual(
        fooMock.timesCalled,
        0,
        'fooMock#timesCalled is initially 0'
      );
      assert.strictEqual(
        barMock.timesCalled,
        0,
        'barMock#timesCalled is initially 0'
      );

      await fetchJSON({ url, params: dataFoo, method });
      assert.strictEqual(
        fooMock.timesCalled,
        1,
        'fooMock#timesCalled is called once'
      );
      assert.strictEqual(
        barMock.timesCalled,
        0,
        'barMock#timesCalled is called once'
      );

      await fetchJSON({ url, params: dataBar, method });
      assert.strictEqual(
        fooMock.timesCalled,
        1,
        'fooMock#timesCalled is called once'
      );
      assert.strictEqual(
        barMock.timesCalled,
        1,
        'barMock#timesCalled is called once'
      );
    });
  }

  ['GET', 'POST', 'PATCH', 'PUT'].forEach(testWithParamsForMethod);
});
