import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { mock } from 'ember-data-factory-guy';
import { fetchJSON, inlineSetup } from '../../helpers/utility-methods';

const serializerType = '-json-api';

module('MockAny', function(hooks) {
  setupTest(hooks);
  inlineSetup(hooks, serializerType);

  test("with incorrect parameters", function(assert) {
    assert.throws(function() {
      mock({url: null})
    }, "missing url");
  });

  test("defaults values for type, status", function(assert) {
    let mockAny = mock({url: '/meep-meep'});

    assert.equal(mockAny.getType(), 'GET');
    assert.equal(mockAny.status, '200');
  });

  test("GET", async function(assert) {
    const method       = 'GET',
          url          = '/api/get-stuff',
          responseText = {what: 'up'};

    mock({url, type: method, responseText});

    const json = await fetchJSON({url, method});

    assert.deepEqual(json, responseText);
  });

  test("PUT", async function(assert) {
    const method       = 'PUT',
          url          = '/api/put-stuff',
          responseText = {what: 'up'};

    mock({url, type: method, responseText});
    let json = await fetchJSON({url, method});

    assert.deepEqual(json, responseText);
  });

  test("PUT with body params", async function(assert) {
    const method     = 'PUT',
          url        = '/api/post-stuff',
          whatsUp    = {whats: 'up'},
          whatsUpDoc = {whats: 'up doc'};

    let theMock = mock({url, type: method}).withParams(whatsUp).returns(whatsUp),
        json    = await fetchJSON({url, params: whatsUp, method});

    assert.deepEqual(json, whatsUp, 'returns json for url with params #1');

    theMock.withParams(whatsUpDoc).returns(whatsUpDoc);
    json = await fetchJSON({url, params: whatsUpDoc, method});

    assert.deepEqual(json, whatsUpDoc, 'returns json for url matching params #2');
  });

  test("PATCH with body params", async function(assert) {
    const method     = 'PATCH',
          url        = '/api/post-stuff',
          whatsUp    = {whats: 'up'},
          whatsUpDoc = {whats: 'up doc'};

    let theMock = mock({url, type: method}).withParams(whatsUp).returns(whatsUp),
        json    = await fetchJSON({url, params: whatsUp, method});

    assert.deepEqual(json, whatsUp, 'returns json for url with params #1');

    theMock.withParams(whatsUpDoc).returns(whatsUpDoc);
    json = await fetchJSON({url, params: whatsUpDoc, method});

    assert.deepEqual(json, whatsUpDoc, 'returns json for url matching params #2');
  });

  test("returns", async function(assert) {
    const method     = 'GET',
          url        = '/api/get-stuff',
          whatsUp    = {whats: 'up'},
          whatsUpDoc = {whats: 'up doc'};

    let theMock = mock({url}).returns(whatsUp);

    let json = await fetchJSON({url, method});
    assert.deepEqual(json, whatsUp, 'returns json that is set');

    theMock.returns(whatsUpDoc);
    json = await fetchJSON({url, method});

    assert.deepEqual(json, whatsUpDoc, 'returns next json that is set');
  });

  test("GET with url params", async function(assert) {
    const method     = 'GET',
          url        = '/api/get-stuff',
          whatsUp    = {whats: 'up', dudes: [1], dude: 1, awake: true, keys: {e: 1}},
          whatsUpDoc = {whats: 'up doc'};

    let theMock = mock({url}).withParams(whatsUp).returns(whatsUp);

    let json = await fetchJSON({url, params: whatsUp, method});
    assert.deepEqual(json, whatsUp, 'returns json for url with params #1');

    theMock.withParams(whatsUpDoc).returns(whatsUpDoc);

    json = await fetchJSON({url, params: whatsUpDoc, method});
    assert.deepEqual(json, whatsUpDoc, 'returns json for url matching params #2');
  });

  test("POST", async function(assert) {
    const method       = 'POST',
          url          = '/api/post-stuff',
          data         = {whats: 'up'},
          responseText = {dude: 'dude'};

    mock({url, type: method, data}).returns(responseText);
    const json = await fetchJSON({url, params: data, method});

    assert.deepEqual(json, responseText, 'returns json for url with params #1');
  });

  test("POST with body params", async function(assert) {
    const method     = 'POST',
          url        = '/api/post-stuff',
          whatsUp    = {whats: 'up'},
          whatsUpDoc = {whats: 'up doc'};

    let theMock = mock({url, type: method}).withParams(whatsUp).returns(whatsUp),
        json    = await fetchJSON({url, params: whatsUp, method});

    assert.deepEqual(json, whatsUp, 'returns json for url with params #1');

    theMock.withParams(whatsUpDoc).returns(whatsUpDoc);
    json = await fetchJSON({url, params: whatsUpDoc, method});

    assert.deepEqual(json, whatsUpDoc, 'returns json for url matching params #2');
  });

  test("mock#timesCalled works as expected", async function(assert) {
    const method = 'POST',
          url    = '/api/post-stuff';

    let theMock = mock({url, type: method});
    assert.equal(theMock.timesCalled, 0, 'mock#timesCalled is initially 0');

    await fetchJSON({url, method});
    assert.equal(theMock.timesCalled, 1, 'mock#timesCalled is called once');
  });

  test("Star segments work", async function(assert) {
    const method = 'POST',
          url    = '/api/post/some-stuff';

    let theMock = mock({url: '/api/*/some-stuff', type: method});
    assert.equal(theMock.timesCalled, 0, 'mock#timesCalled is initially 0');

    await fetchJSON({url, method});
    assert.equal(theMock.timesCalled, 1, 'mock#timesCalled is called once');
  });

  test("#withParams", async function(assert) {
    const method  = 'POST',
          url     = '/api/post/some-stuff',
          dataFoo = {foo: 'foo'},
          dataBar = {bar: 'bar'};

    let fooMock = mock({url: '/api/post/some-stuff', type: method}).withParams(dataFoo);
    let barMock = mock({url: '/api/post/some-stuff', type: method}).withParams(dataBar);
    assert.equal(fooMock.timesCalled, 0, 'fooMock#timesCalled is initially 0');
    assert.equal(barMock.timesCalled, 0, 'barMock#timesCalled is initially 0');

    await fetchJSON({url, params: dataFoo, method});
    await fetchJSON({url, params: dataBar, method});

    assert.equal(fooMock.timesCalled, 1, 'fooMock#timesCalled is called once');
    assert.equal(barMock.timesCalled, 1, 'barMock#timesCalled is called once');
  });

  test("#withSomeParams", async function(assert) {
    const method  = 'POST',
          url     = '/api/post/some-stuff',
          dataFoo = {foo: 'foo'},
          dataBar = {bar: 'bar'};

    let fooMock = mock({url: '/api/post/some-stuff', type: method}).withSomeParams(dataFoo);
    let barMock = mock({url: '/api/post/some-stuff', type: method}).withSomeParams(dataBar);

    assert.equal(fooMock.timesCalled, 0, 'fooMock#timesCalled is initially 0');
    assert.equal(barMock.timesCalled, 0, 'barMock#timesCalled is initially 0');

    await fetchJSON({url, params: dataFoo, method});
    await fetchJSON({url, params: dataBar, method});

    assert.equal(fooMock.timesCalled, 1, 'fooMock#timesCalled is called once');
    assert.equal(barMock.timesCalled, 1, 'barMock#timesCalled is called once');
  });
});
