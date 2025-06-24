import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { mock } from 'ember-data-factory-guy';
import { fetchJSON, inlineSetup } from '../../helpers/utility-methods';

module('MockAny', function (hooks) {
  setupTest(hooks);
  inlineSetup(hooks, '-json-api');

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
    const json = await (await fetch(url, { method })).json();

    assert.deepEqual(json, responseText);
  });

  test('GET', async function (assert) {
    const method = 'GET',
      url = '/api/get-stuff',
      responseText = { what: 'up' };

    mock({ url, type: method, responseText });

    const json = await (await fetch(url, { method })).json();

    assert.deepEqual(json, responseText);
  });

  test('PUT', async function (assert) {
    const method = 'PUT',
      url = '/api/put-stuff',
      responseText = { what: 'up' };

    mock({ url, type: method, responseText });
    const json = await (await fetch(url, { method })).json();

    assert.deepEqual(json, responseText);
  });

  test('PUT with body params', async function (assert) {
    const method = 'PUT',
      url = '/api/post-stuff',
      whatsUp = { whats: 'up' },
      whatsUpDoc = { whats: 'up doc' };

    let theMock = mock({ url, type: method })
      .withParams(whatsUp)
      .returns(whatsUp);
    const json1 = await (
      await fetch(url, { method, body: JSON.stringify(whatsUp) })
    ).json();

    assert.deepEqual(json1, whatsUp, 'returns json for url with params #1');

    theMock.withParams(whatsUpDoc).returns(whatsUpDoc);
    const json2 = await (
      await fetch(url, { method, body: JSON.stringify(whatsUpDoc) })
    ).json();

    assert.deepEqual(
      json2,
      whatsUpDoc,
      'returns json for url matching params #2',
    );
  });

  test('PATCH with body params', async function (assert) {
    const method = 'PATCH',
      url = '/api/post-stuff',
      whatsUp = { whats: 'up' },
      whatsUpDoc = { whats: 'up doc' };

    let theMock = mock({ url, type: method })
      .withParams(whatsUp)
      .returns(whatsUp);
    const json1 = await (
      await fetch(url, { method, body: JSON.stringify(whatsUp) })
    ).json();

    assert.deepEqual(json1, whatsUp, 'returns json for url with params #1');

    theMock.withParams(whatsUpDoc).returns(whatsUpDoc);
    const json2 = await (
      await fetch(url, { method, body: JSON.stringify(whatsUpDoc) })
    ).json();

    assert.deepEqual(
      json2,
      whatsUpDoc,
      'returns json for url matching params #2',
    );
  });

  test('returns', async function (assert) {
    const method = 'GET',
      url = '/api/get-stuff',
      whatsUp = { whats: 'up' },
      whatsUpDoc = { whats: 'up doc' };

    let theMock = mock({ url }).returns(whatsUp);

    const json1 = await (await fetch(url, { method })).json();
    assert.deepEqual(json1, whatsUp, 'returns json that is set');

    theMock.returns(whatsUpDoc);
    const json2 = await (await fetch(url, { method })).json();

    assert.deepEqual(json2, whatsUpDoc, 'returns next json that is set');
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

    const searchParams1 = new URLSearchParams();
    searchParams1.append('whats', 'up');
    searchParams1.append('dudes[]', 1);
    searchParams1.append('dude', 1);
    searchParams1.append('awake', true);
    searchParams1.append('keys[e]', 1);
    const json1 = await (
      await fetch(`${url}?${searchParams1.toString()}`, { method })
    ).json();
    assert.deepEqual(json1, whatsUp, 'returns json for url with params #1');

    theMock.withParams(whatsUpDoc).returns(whatsUpDoc);

    const searchParams2 = new URLSearchParams();
    searchParams2.append('whats', 'up doc');
    const json2 = await (
      await fetch(`${url}?${searchParams2.toString()}`, { method })
    ).json();
    assert.deepEqual(
      json2,
      whatsUpDoc,
      'returns json for url matching params #2',
    );
  });

  test('POST', async function (assert) {
    const method = 'POST',
      url = '/api/post-stuff',
      data = { whats: 'up' },
      responseText = { dude: 'dude' };

    mock({ url, type: method, data }).returns(responseText);
    const json = await (
      await fetch(url, { method, body: JSON.stringify(data) })
    ).json();

    assert.deepEqual(json, responseText, 'returns json for url with params #1');
  });

  test('POST with body params', async function (assert) {
    const method = 'POST',
      url = '/api/post-stuff',
      whatsUp = { whats: 'up' },
      whatsUpDoc = { whats: 'up doc' };

    let theMock = mock({ url, type: method })
      .withParams(whatsUp)
      .returns(whatsUp);
    const json1 = await (
      await fetch(url, { method, body: JSON.stringify(whatsUp) })
    ).json();

    assert.deepEqual(json1, whatsUp, 'returns json for url with params #1');

    theMock.withParams(whatsUpDoc).returns(whatsUpDoc);
    const json2 = await (
      await fetch(url, { method, body: JSON.stringify(whatsUpDoc) })
    ).json();

    assert.deepEqual(
      json2,
      whatsUpDoc,
      'returns json for url matching params #2',
    );
  });

  test('match the request body', async function (assert) {
    const method = 'POST',
      url = '/api/post-stuff',
      whatsUp = { whats: 'up' };

    const theMock = mock({ url, type: method }).match(whatsUp);

    await fetch(url, { method, body: JSON.stringify(whatsUp) });
    assert.strictEqual(theMock.timesCalled, 1, 'exact match');

    await fetch(url, {
      method,
      body: JSON.stringify({ whats: 'up', foo: 'bar' }),
    });
    assert.strictEqual(theMock.timesCalled, 2, 'partial match');
  });

  test('match a function', async function (assert) {
    assert.expect(1);
    const method = 'POST',
      url = '/api/post-stuff',
      whatsUp = { whats: 'up' };

    mock({ url, type: method }).match(function (requestData) {
      assert.deepEqual(requestData, whatsUp);
      return true;
    });

    await fetch(url, { method, body: JSON.stringify(whatsUp) });
  });

  test('mock#timesCalled works as expected', async function (assert) {
    const method = 'POST',
      url = '/api/post-stuff';

    let theMock = mock({ url, type: method });
    assert.strictEqual(
      theMock.timesCalled,
      0,
      'mock#timesCalled is initially 0',
    );

    await fetch(url, { method });
    assert.strictEqual(
      theMock.timesCalled,
      1,
      'mock#timesCalled is called once',
    );
  });

  test('Star segments work', async function (assert) {
    const method = 'POST',
      url = '/api/post/some-stuff';

    let theMock = mock({ url: '/api/*/some-stuff', type: method });
    assert.strictEqual(
      theMock.timesCalled,
      0,
      'mock#timesCalled is initially 0',
    );

    await fetch(url, { method });
    assert.strictEqual(
      theMock.timesCalled,
      1,
      'mock#timesCalled is called once',
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
        'fooMock#timesCalled is initially 0',
      );
      assert.strictEqual(
        barMock.timesCalled,
        0,
        'barMock#timesCalled is initially 0',
      );

      await fetchJSON({
        url,
        method,
        params: Object.assign({ extra: 123 }, dataFoo),
      });
      assert.strictEqual(
        fooMock.timesCalled,
        1,
        'fooMock#timesCalled is called once',
      );
      assert.strictEqual(
        barMock.timesCalled,
        0,
        'barMock#timesCalled is called once',
      );

      await fetchJSON({
        url,
        method,
        params: Object.assign({ extra: 123 }, dataBar),
      });
      assert.strictEqual(
        fooMock.timesCalled,
        1,
        'fooMock#timesCalled is called once',
      );
      assert.strictEqual(
        barMock.timesCalled,
        1,
        'barMock#timesCalled is called once',
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
        'fooMock#timesCalled is initially 0',
      );
      assert.strictEqual(
        barMock.timesCalled,
        0,
        'barMock#timesCalled is initially 0',
      );

      await fetchJSON({ url, params: dataFoo, method });
      assert.strictEqual(
        fooMock.timesCalled,
        1,
        'fooMock#timesCalled is called once',
      );
      assert.strictEqual(
        barMock.timesCalled,
        0,
        'barMock#timesCalled is called once',
      );

      await fetchJSON({ url, params: dataBar, method });
      assert.strictEqual(
        fooMock.timesCalled,
        1,
        'fooMock#timesCalled is called once',
      );
      assert.strictEqual(
        barMock.timesCalled,
        1,
        'barMock#timesCalled is called once',
      );
    });
  }

  ['GET', 'POST', 'PATCH', 'PUT'].forEach(testWithParamsForMethod);
});
