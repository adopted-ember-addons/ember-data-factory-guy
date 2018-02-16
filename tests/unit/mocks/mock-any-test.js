import Ember from 'ember';
import { moduleFor, test } from 'ember-qunit';
import { mock } from 'ember-data-factory-guy';
import { inlineSetup } from '../../helpers/utility-methods';

const serializerType = '-json-api';

moduleFor('serializer:application', 'MockAny', inlineSetup(serializerType));

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

test("get", async function(assert) {
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

test("put", async function(assert) {
  const callOpts     = {
          type: 'PUT',
          url: '/api/put-stuff',
          data: {number: 1}
        },
        responseText = {what: 'up'},
        mockOpts     = Object.assign({responseText}, callOpts);

  mock(mockOpts);
  let json = await Ember.$.ajax(callOpts);
  assert.deepEqual(JSON.parse(json), responseText);
});

test("returns", async function(assert) {
  const type = 'GET',
        url = '/api/get-stuff',
        whatsUp = {whats: 'up'},
        whatsUpDoc = {whats: 'up doc'};

  let theMock = mock({url}).returns(whatsUp);

  let json = await Ember.$.ajax({type, url});
  assert.deepEqual(JSON.parse(json), whatsUp, 'returns json that is set');

  theMock.returns(whatsUpDoc);
  json = await Ember.$.ajax({type, url});
  assert.deepEqual(JSON.parse(json), whatsUpDoc, 'returns next json that is set');
});
