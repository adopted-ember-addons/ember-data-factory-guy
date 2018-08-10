import Ember from 'ember';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { mock } from 'ember-data-factory-guy';
import { inlineSetup } from '../../helpers/utility-methods';

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
    const callOpts     = {
            type: 'GET',
            url: '/api/get-stuff',
          },
          responseText = {what: 'up'},
          mockOpts     = Object.assign({responseText}, callOpts);

    mock(mockOpts);
    let json = await Ember.$.ajax(callOpts);
    assert.deepEqual(JSON.parse(json), responseText);
  });

  test("PUT", async function(assert) {
    const callOpts     = {
            type: 'PUT',
            url: '/api/put-stuff',
            data: JSON.stringify({number: 1})
          },
          responseText = {what: 'up'},
          mockOpts     = Object.assign({responseText}, callOpts);

    mock(mockOpts);
    let json = await Ember.$.ajax(callOpts);
    assert.deepEqual(JSON.parse(json), responseText);
  });

  test("PUT with body params", async function(assert) {
    const type       = 'PUT',
          url        = '/api/post-stuff',
          whatsUp    = {whats: 'up'},
          whatsUpDoc = {whats: 'up doc'};

    let theMock = mock({url, type}).withParams(whatsUp).returns(whatsUp),
        json    = await Ember.$.ajax({type, url, data: whatsUp});

    assert.deepEqual(JSON.parse(json), whatsUp, 'returns json for url with params #1');

    theMock.withParams(whatsUpDoc).returns(whatsUpDoc);
    json = await Ember.$.ajax({type, url, data: whatsUpDoc});
    assert.deepEqual(JSON.parse(json), whatsUpDoc, 'returns json for url matching params #2');
  });

  test("PATCH with body params", async function(assert) {
    const type       = 'PATCH',
          url        = '/api/post-stuff',
          whatsUp    = {whats: 'up'},
          whatsUpDoc = {whats: 'up doc'};

    let theMock = mock({url, type}).withParams(whatsUp).returns(whatsUp),
        json    = await Ember.$.ajax({type, url, data: whatsUp});

    assert.deepEqual(JSON.parse(json), whatsUp, 'returns json for url with params #1');

    theMock.withParams(whatsUpDoc).returns(whatsUpDoc);
    json = await Ember.$.ajax({type, url, data: whatsUpDoc});
    assert.deepEqual(JSON.parse(json), whatsUpDoc, 'returns json for url matching params #2');
  });

  test("returns", async function(assert) {
    const type       = 'GET',
          url        = '/api/get-stuff',
          whatsUp    = {whats: 'up'},
          whatsUpDoc = {whats: 'up doc'};

    let theMock = mock({url}).returns(whatsUp);

    let json = await Ember.$.ajax({type, url});
    assert.deepEqual(JSON.parse(json), whatsUp, 'returns json that is set');

    theMock.returns(whatsUpDoc);
    json = await Ember.$.ajax({type, url});
    assert.deepEqual(JSON.parse(json), whatsUpDoc, 'returns next json that is set');
  });

  test("GET with url params", async function(assert) {
    const type       = 'GET',
          url        = '/api/get-stuff',
          whatsUp    = {whats: 'up'},
          whatsUpDoc = {whats: 'up doc'};

    let theMock = mock({url}).withParams(whatsUp).returns(whatsUp);
    let json = await Ember.$.ajax({type, url, data: whatsUp});
    assert.deepEqual(JSON.parse(json), whatsUp, 'returns json for url with params #1');

    theMock.withParams(whatsUpDoc).returns(whatsUpDoc);
    json = await Ember.$.ajax({type, url, data: whatsUpDoc});
    assert.deepEqual(JSON.parse(json), whatsUpDoc, 'returns json for url matching params #2');
  });

  test("POST", async function(assert) {
    const type         = 'POST',
          url          = '/api/post-stuff',
          data         = {whats: 'up'},
          responseText = {dude: 'dude'};

    mock({url, type, data}).returns(responseText);
    const json = await Ember.$.ajax({type, url, data});

    assert.deepEqual(JSON.parse(json), responseText, 'returns json for url with params #1');
  });

  test("POST with body params", async function(assert) {
    const type       = 'POST',
          url        = '/api/post-stuff',
          whatsUp    = {whats: 'up'},
          whatsUpDoc = {whats: 'up doc'};

    let theMock = mock({url, type}).withParams(whatsUp).returns(whatsUp),
        json    = await Ember.$.ajax({type, url, data: whatsUp});

    assert.deepEqual(JSON.parse(json), whatsUp, 'returns json for url with params #1');

    theMock.withParams(whatsUpDoc).returns(whatsUpDoc);
    json = await Ember.$.ajax({type, url, data: whatsUpDoc});
    assert.deepEqual(JSON.parse(json), whatsUpDoc, 'returns json for url matching params #2');
  });
});
