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