import Ember from 'ember';
import { moduleFor, test } from 'ember-qunit';
import { mock } from 'ember-data-factory-guy';
import { inlineSetup } from '../../helpers/utility-methods';

const serializerType = '-json-api';

moduleFor('serializer:application', 'MockRequest ad hoc mocks', inlineSetup(serializerType));

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