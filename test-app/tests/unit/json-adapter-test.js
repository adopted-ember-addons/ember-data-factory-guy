import { module, test, skip } from 'qunit';
import { setupTest } from 'ember-qunit';
import FactoryGuy, {
  build,
  buildList,
  mockFindRecord,
} from 'ember-data-factory-guy';
import SharedCommonBehavior from './shared-common-behaviour';
import SharedAdapterBehaviour from './shared-adapter-behaviour';
import { inlineSetup } from '../helpers/utility-methods';

let serializer = 'DS.RESTAdapter/JSONSerializer';
let serializerType = '-json';

module(serializer, function (hooks) {
  setupTest(hooks);
  inlineSetup(hooks, serializerType);

  SharedCommonBehavior.all();

  SharedAdapterBehaviour.mockFindRecordEmbeddedTests();
  SharedAdapterBehaviour.mockFindAllEmbeddedTests();

  SharedAdapterBehaviour.mockUpdateWithErrorMessages();
  SharedAdapterBehaviour.mockUpdateReturnsEmbeddedAssociations();

  SharedAdapterBehaviour.mockCreateReturnsEmbeddedAssociations();
  SharedAdapterBehaviour.mockCreateFailsWithErrorResponse();

  module('#mockFindRecord custom', function () {
    test('when returns json (plain) is used', async function (assert) {
      let json = { id: '1', description: 'the desc' },
        mock = mockFindRecord('profile').returns({ json }),
        profileId = mock.get('id');

      const profile = await FactoryGuy.store.findRecord('profile', profileId);

      assert.strictEqual(profile.get('id'), profileId.toString());
      assert.strictEqual(profile.get('description'), json.get('description'));
    });
  });

  module('FactoryGuy#build get`', function () {
    test('returns all attributes with no key', function (assert) {
      let user = build('user');
      assert.deepEqual(user.get(), { id: '1', name: 'User1', style: 'normal' });
      assert.strictEqual(user.get().id, '1');
      assert.strictEqual(user.get().name, 'User1');
    });

    test('returns an attribute with a key', function (assert) {
      let user = build('user');
      assert.strictEqual(user.get('id'), '1');
      assert.strictEqual(user.get('name'), 'User1');
    });
  });

  module('FactoryGuy#buildList get`', function () {
    test('returns array of all attributes with no key', function (assert) {
      let users = buildList('user', 2);
      assert.deepEqual(users.get(), [
        { id: '1', name: 'User1', style: 'normal' },
        { id: '2', name: 'User2', style: 'normal' },
      ]);
    });

    test('returns an attribute with a key', function (assert) {
      let users = buildList('user', 2);
      assert.deepEqual(users.get(0), {
        id: '1',
        name: 'User1',
        style: 'normal',
      });
      assert.strictEqual(users.get(0).id, '1');
      assert.deepEqual(users.get(1), {
        id: '2',
        name: 'User2',
        style: 'normal',
      });
      assert.strictEqual(users.get(1).name, 'User2');
    });
  });

  module('FactoryGuy#build custom`', function () {
    test('belongsTo ( not polymorphic ) record as id', function (assert) {
      let company = build('company');
      let buildJson = build('property', { company });
      buildJson.unwrap();

      let expectedJson = {
        id: '1',
        name: 'Silly property',
        company: '1',
      };

      assert.deepEqual(buildJson, expectedJson);
    });

    test('hasMany ( not polymorphic ) records as ids', function (assert) {
      let owners = buildList('user', 2);
      let buildJson = build('property', { owners });
      buildJson.unwrap();

      let expectedJson = {
        id: '1',
        name: 'Silly property',
        owners: ['1', '2'],
      };

      assert.deepEqual(buildJson, expectedJson);
    });

    test('embeds belongsTo record when serializer attrs => embedded: always ', function (assert) {
      let buildJson = build('comic-book', 'marvel');
      buildJson.unwrap();

      let expectedJson = {
        id: '1',
        name: 'Comic Times #1',
        company: { id: '1', type: 'Company', name: 'Marvel Comics' },
      };

      assert.deepEqual(buildJson, expectedJson);
    });

    test('embeds belongsTo record passed as prebuilt ( build ) json when serializer attrs => embedded: always ', function (assert) {
      let marvel = build('marvel');
      let buildJson = build('comic-book', { company: marvel });
      buildJson.unwrap();

      let expectedJson = {
        id: '1',
        name: 'Comic Times #1',
        company: { id: '1', type: 'Company', name: 'Marvel Comics' },
      };

      assert.deepEqual(buildJson, expectedJson);
    });

    test('embeds hasMany records when serializer attrs => embedded: always', function (assert) {
      let buildJson = build('comic-book', 'with_included_villains');
      buildJson.unwrap();

      let expectedJson = {
        id: '1',
        name: 'Comic Times #1',
        includedVillains: [
          { id: '1', type: 'Villain', name: 'BadGuy#1' },
          { id: '2', type: 'Villain', name: 'BadGuy#2' },
        ],
      };

      assert.deepEqual(buildJson, expectedJson);
    });

    test('embeds polymorphic hasMany records when serializer attrs => embedded: always', function (assert) {
      let buildJson = build('comic-book', 'with_bad_guys');
      buildJson.unwrap();

      let expectedJson = {
        id: '1',
        name: 'Comic Times #1',
        characters: [
          { id: '1', type: 'Villain', name: 'BadGuy#1' },
          { id: '2', type: 'Villain', name: 'BadGuy#2' },
        ],
      };

      assert.deepEqual(buildJson, expectedJson);
    });

    test('embeds hasMany records passed as prebuilt ( buildList ) json when serializer attrs => embedded: always', function (assert) {
      let badGuys = buildList('villain', 2);
      let buildJson = build('comic-book', { characters: badGuys });
      buildJson.unwrap();

      let expectedJson = {
        id: '1',
        name: 'Comic Times #1',
        characters: [
          { id: '1', type: 'Villain', name: 'BadGuy#1' },
          { id: '2', type: 'Villain', name: 'BadGuy#2' },
        ],
      };

      assert.deepEqual(buildJson, expectedJson);
    });

    // Nov 4 2016 => not sure why these tests for manager model are here because this
    // model is  REST model using EmbeddedRecordsMixin which is not compatible with JSONSerializer
    // so what did I put tests for that here ?? can't remember

    skip("embeds belongsTo record when serializer attrs => deserialize: 'records' ", function (assert) {
      let buildJson = build('manager', 'withSalary');
      buildJson.unwrap();

      let expectedJson = {
        id: '1',
        name: {
          firstName: 'Tyrion',
          lastName: 'Lannister',
        },
        salary: {
          id: '1',
          income: 90000,
          benefits: ['health', 'company car', 'dental'],
        },
      };

      assert.deepEqual(buildJson, expectedJson);
    });

    skip("embeds belongsTo record passed as prebuilt ( build ) json when serializer attrs => deserialize: 'records' ", function (assert) {
      let salary = build('salary');
      let buildJson = build('manager', { salary: salary });
      buildJson.unwrap();

      let expectedJson = {
        id: '1',
        name: {
          firstName: 'Tyrion',
          lastName: 'Lannister',
        },
        salary: {
          id: '1',
          income: 90000,
          benefits: ['health', 'company car', 'dental'],
        },
      };

      assert.deepEqual(buildJson, expectedJson);
    });

    skip("embeds hasMany records when serializer attrs => deserialize: 'records'", function (assert) {
      let buildJson = build('manager', 'with_reviews');
      buildJson.unwrap();

      let expectedJson = {
        id: '1',
        name: {
          firstName: 'Tyrion',
          lastName: 'Lannister',
        },
        reviews: [
          {
            id: '1',
            rating: 1,
            date: '2015-05-01T00:00:00.000Z',
          },
          {
            id: '2',
            rating: 2,
            date: '2015-05-01T00:00:00.000Z',
          },
        ],
      };

      assert.deepEqual(buildJson, expectedJson);
    });

    skip("embeds hasMany records passed as prebuilt ( buildList ) json when serializer attrs => deserialize: 'records'", function (assert) {
      let reviews = buildList('review', 2);
      let buildJson = build('manager', { reviews: reviews });
      buildJson.unwrap();

      let expectedJson = {
        id: '1',
        name: {
          firstName: 'Tyrion',
          lastName: 'Lannister',
        },
        reviews: [
          {
            id: '1',
            rating: 1,
            date: '2015-05-01T00:00:00.000Z',
          },
          {
            id: '2',
            rating: 2,
            date: '2015-05-01T00:00:00.000Z',
          },
        ],
      };

      assert.deepEqual(buildJson, expectedJson);
    });

    // the override for primaryKey is in the helpers/utilityMethods.js
    test('serializer primaryKey override', function (assert) {
      let json = build('cat');
      assert.strictEqual(json.get('catId'), '1');
      assert.strictEqual(json.get('id'), '1');
    });

    test('serializes attributes with custom type', function (assert) {
      let info = { first: 1 };
      let buildJson = build('user', { info: info });
      buildJson.unwrap();

      let expectedJson = {
        id: '1',
        name: 'User1',
        style: 'normal',
        info: '{"first":1}',
      };

      assert.deepEqual(buildJson, expectedJson);
    });

    test('with links for belongsTo relationship', async function (assert) {
      let companyLink = '/user/1/company',
        buildJson = build('user', { links: { company: companyLink } });

      buildJson.unwrap();

      let expectedJson = {
        id: '1',
        name: 'User1',
        style: 'normal',
        links: { company: companyLink },
      };

      assert.deepEqual(buildJson, expectedJson);
    });

    test('with links for hasMany relationship', function (assert) {
      let propertyLink = '/user/1/properties',
        buildJson = build('user', { links: { properties: propertyLink } });

      buildJson.unwrap();

      let expectedJson = {
        id: '1',
        name: 'User1',
        style: 'normal',
        links: { properties: propertyLink },
      };

      assert.deepEqual(buildJson, expectedJson);
    });
  });
});
