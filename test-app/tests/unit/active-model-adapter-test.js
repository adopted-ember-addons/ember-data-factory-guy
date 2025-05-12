import { dasherize } from '@ember/string';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import FactoryGuy, {
  build,
  buildList,
  mockCreate,
} from 'ember-data-factory-guy';
import SharedCommonBehavior from './shared-common-behaviour';
import SharedAdapterBehaviour from './shared-adapter-behaviour';
import { inlineSetup } from '../helpers/utility-methods';

let serializer = 'DS.ActiveModelSerializer';
let serializerType = '-active-model';

module(serializer, function (hooks) {
  setupTest(hooks);
  inlineSetup(hooks, serializerType);

  SharedCommonBehavior.all();

  SharedAdapterBehaviour.mockFindRecordSideloadingTests();
  SharedAdapterBehaviour.mockFindAllSideloadingTests();

  SharedAdapterBehaviour.mockQueryMetaTests();

  SharedAdapterBehaviour.mockUpdateWithErrorMessages();
  SharedAdapterBehaviour.mockUpdateReturnsAssociations();
  SharedAdapterBehaviour.mockUpdateReturnsEmbeddedAssociations();

  SharedAdapterBehaviour.mockCreateReturnsAssociations();
  SharedAdapterBehaviour.mockCreateFailsWithErrorResponse();
  SharedAdapterBehaviour.mockCreateReturnsEmbeddedAssociations();

  module('#mockCreate custom', function () {
    test('returns camelCase attributes', async function (assert) {
      let customDescription = 'special description';

      mockCreate('profile').returns({
        attrs: { camel_case_description: customDescription },
      });

      let profile = FactoryGuy.store.createRecord('profile', {
        camel_case_description: 'description',
      });

      await profile.save();

      assert.strictEqual(
        profile.get('camelCaseDescription'),
        customDescription,
      );
    });
  });

  module('FactoryGuy#build custom', function () {
    test('uses the correct key when overridden in the serializer', async function (assert) {
      let buildJson = build('dog', 'withOwner');
      assert.strictEqual(buildJson.get('owner_id'), undefined);
      assert.strictEqual(buildJson.get('humanId'), '1');
    });

    test('embeds hasMany record when serializer attrs => embedded: always ', function (assert) {
      let buildJson = build('comic-book', 'with_included_villains');
      buildJson.unwrap();

      let expectedJson = {
        comic_book: {
          id: '1',
          name: 'Comic Times #1',
          included_villains: [
            { id: '1', type: 'Villain', name: 'BadGuy#1' },
            { id: '2', type: 'Villain', name: 'BadGuy#2' },
          ],
        },
      };

      assert.deepEqual(buildJson, expectedJson);
    });

    test('embeds polymorphic hasMany record when serializer attrs => embedded: always ', function (assert) {
      let buildJson = build('comic-book', 'with_bad_guys');
      buildJson.unwrap();

      let expectedJson = {
        comic_book: {
          id: '1',
          name: 'Comic Times #1',
          characters: [
            { id: '1', type: 'Villain', name: 'BadGuy#1' },
            { id: '2', type: 'Villain', name: 'BadGuy#2' },
          ],
        },
      };

      assert.deepEqual(buildJson, expectedJson);
    });

    test('embeds belongsTo record when serializer attrs => embedded: always ', function (assert) {
      let buildJson = build('comic-book', 'marvel');
      buildJson.unwrap();

      let expectedJson = {
        comic_book: {
          id: '1',
          name: 'Comic Times #1',
          company: { id: '1', type: 'Company', name: 'Marvel Comics' },
        },
      };

      assert.deepEqual(buildJson, expectedJson);
    });

    test('sideloads belongsTo records which are built from fixture definition', function (assert) {
      let buildJson = build('profile', 'with_bat_man');
      buildJson.unwrap();

      let expectedJson = {
        profile: {
          id: '1',
          description: 'Text goes here',
          camel_case_description: 'textGoesHere',
          snake_case_description: 'text_goes_here',
          a_boolean_field: false,
          super_hero_id: '1',
        },
        'super-heros': [
          {
            id: '1',
            name: 'BatMan',
            type: 'SuperHero',
          },
        ],
      };

      assert.deepEqual(buildJson, expectedJson);
    });

    test('sideloads belongsTo record passed as ( prebuilt ) attribute', function (assert) {
      let batMan = build('bat_man');
      let buildJson = build('profile', { superHero: batMan });
      buildJson.unwrap();

      let expectedJson = {
        profile: {
          id: '1',
          description: 'Text goes here',
          camel_case_description: 'textGoesHere',
          snake_case_description: 'text_goes_here',
          a_boolean_field: false,
          super_hero_id: '1',
        },
        'super-heros': [
          {
            id: '1',
            name: 'BatMan',
            type: 'SuperHero',
          },
        ],
      };

      assert.deepEqual(buildJson, expectedJson);
    });

    test('sideloads hasMany records built from fixture definition', function (assert) {
      let buildJson = build('user', 'with_hats');
      buildJson.unwrap();

      let expectedJson = {
        user: {
          id: '1',
          name: 'User1',
          style: 'normal',
          hats: [
            { type: 'big-hat', id: '1' },
            { type: 'big-hat', id: '2' },
          ],
        },
        'big-hats': [
          { id: '1', type: 'BigHat' },
          { id: '2', type: 'BigHat' },
        ],
      };

      assert.deepEqual(buildJson, expectedJson);
    });

    test('sideloads hasMany records passed as prebuilt ( buildList ) attribute', function (assert) {
      let hats = buildList('big-hat', 2);
      let buildJson = build('user', { hats: hats });
      buildJson.unwrap();

      let expectedJson = {
        user: {
          id: '1',
          name: 'User1',
          style: 'normal',
          hats: [
            { type: 'big-hat', id: '1' },
            { type: 'big-hat', id: '2' },
          ],
        },
        'big-hats': [
          { id: '1', type: 'BigHat' },
          { id: '2', type: 'BigHat' },
        ],
      };

      assert.deepEqual(buildJson, expectedJson);
    });

    test('sideloads hasMany records passed as prebuilt ( array of build ) attribute', function (assert) {
      let hat1 = build('big-hat');
      let hat2 = build('big-hat');
      let buildJson = build('user', { hats: [hat1, hat2] });
      buildJson.unwrap();

      let expectedJson = {
        user: {
          id: '1',
          name: 'User1',
          style: 'normal',
          hats: [
            { type: 'big-hat', id: '1' },
            { type: 'big-hat', id: '2' },
          ],
        },
        'big-hats': [
          { id: '1', type: 'BigHat' },
          { id: '2', type: 'BigHat' },
        ],
      };

      assert.deepEqual(buildJson, expectedJson);
    });

    test('using custom serialize keys function for transforming attributes and relationship keys', function (assert) {
      let serializer = FactoryGuy.store.serializerFor('application');

      let savedKeyForAttributeFn = serializer.keyForAttribute;
      serializer.keyForAttribute = dasherize;
      let savedKeyForRelationshipFn = serializer.keyForRelationship;
      serializer.keyForRelationship = dasherize;

      let buildJson = build('profile', 'with_bat_man');
      buildJson.unwrap();

      let expectedJson = {
        profile: {
          id: '1',
          description: 'Text goes here',
          'camel-case-description': 'textGoesHere',
          'snake-case-description': 'text_goes_here',
          'a-boolean-field': false,
          'super-hero': '1',
        },
        'super-heros': [
          {
            id: '1',
            name: 'BatMan',
            type: 'SuperHero',
          },
        ],
      };

      assert.deepEqual(buildJson, expectedJson);

      serializer.keyForAttribute = savedKeyForAttributeFn;
      serializer.keyForRelationship = savedKeyForRelationshipFn;
    });

    test('serializes attributes with custom type', function (assert) {
      let info = { first: 1 };
      let buildJson = build('user', { info: info });
      buildJson.unwrap();

      let expectedJson = {
        user: {
          id: '1',
          name: 'User1',
          style: 'normal',
          info: '{"first":1}',
        },
      };

      assert.deepEqual(buildJson, expectedJson);
    });
  });
});
