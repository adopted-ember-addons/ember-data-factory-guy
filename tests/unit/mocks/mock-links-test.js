import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import {
  buildList,
  make,
  makeList,
  mockLinks,
} from '@eflexsystems/ember-data-factory-guy';
import { inlineSetup } from '../../helpers/utility-methods';
import { settled } from '@ember/test-helpers';

const serializerType = 'json-api';

module('MockLinks', function (hooks) {
  setupTest(hooks);
  inlineSetup(hooks, serializerType);

  test('with no parameters', function (assert) {
    assert.throws(function () {
      mockLinks();
    }, 'requires at least model and a relationshipKey');
  });

  test('with only model parameter', function (assert) {
    assert.throws(function () {
      mockLinks(make('user'));
    }, 'requires at least model and a relationshipKey');
  });

  test('getUrl and status for belongsTo links', function (assert) {
    let companyLink = '/users/1/company',
      user = make('user', { links: { company: companyLink } }),
      mockCompany = mockLinks(user, 'company');

    assert.strictEqual(mockCompany.getUrl(), companyLink);
    assert.strictEqual(mockCompany.status, 200);
  });

  test('getUrl and status for hasMany links', function (assert) {
    let propertiesLink = '/users/1/properties',
      user = make('user', { links: { properties: propertiesLink } }),
      mockProperties = mockLinks(user, 'properties');

    assert.strictEqual(mockProperties.getUrl(), propertiesLink);
    assert.strictEqual(mockProperties.status, 200);
  });

  test('handles links url with query parameters', async function (assert) {
    let propertiesLink = '/users/1/properties?dudes=2',
      user = make('user', { links: { properties: propertiesLink } }),
      json = buildList('property', 1),
      mockProperties = mockLinks(user, 'properties').returns({ json });

    assert.strictEqual(mockProperties.getUrl(), '/users/1/properties');
    assert.deepEqual(mockProperties.queryParams, { dudes: '2' });

    await user.properties;
    await settled();
    assert.strictEqual(mockProperties.timesCalled, 1);
  });

  test('hasMany links returns buildList payload', async function (assert) {
    let user = make('user', 'propertiesLink'),
      properties = buildList('property', 1);

    mockLinks(user, 'properties').returns({ json: properties });
    let userProperties = await user.properties;
    assert.deepEqual(
      userProperties.map(({ id }) => id),
      properties.get().map((f) => String(f.id)),
    );
  });

  test('hasMany links returns makeList payload', async function (assert) {
    let user = make('user', 'propertiesLink');
    let properties = makeList('property', 1);

    mockLinks(user, 'properties').returns({ models: properties });
    let userProperties = await user.properties;
    assert.deepEqual(userProperties, properties);
  });
});
