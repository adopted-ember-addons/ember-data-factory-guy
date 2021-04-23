import { underscore } from '@ember/string';
import { run } from '@ember/runloop';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import FactoryGuy, {
  build,
  buildList,
  make,
  mockCreate,
  mockFindRecord,
} from 'ember-data-factory-guy';
import SharedCommonBehavior from './shared-common-behaviour';
import SharedAdapterBehaviour from './shared-adapter-behaviour';
import { inlineSetup } from '../helpers/utility-methods';

let serializer = 'DS.JSONAPISerializer';
let serializerType = '-json-api';

module(serializer, function (hooks) {
  setupTest(hooks);
  inlineSetup(hooks, serializerType);

  SharedCommonBehavior.all(serializer, serializerType);

  SharedAdapterBehaviour.mockFindRecordSideloadingTests(
    serializer,
    serializerType
  );
  SharedAdapterBehaviour.mockFindAllSideloadingTests(
    serializer,
    serializerType
  );

  SharedAdapterBehaviour.mockQueryMetaTests(serializer, serializerType);

  SharedAdapterBehaviour.mockUpdateWithErrorMessages(
    serializer,
    serializerType
  );
  SharedAdapterBehaviour.mockUpdateReturnsAssociations(
    serializer,
    serializerType
  );

  SharedAdapterBehaviour.mockCreateReturnsAssociations(
    serializer,
    serializerType
  );
  SharedAdapterBehaviour.mockCreateFailsWithErrorResponse(
    serializer,
    serializerType
  );

  module('#mockFindRecord custom', function () {
    test('when returns json (plain) is used', function (assert) {
      run(() => {
        let done = assert.async(),
          json = {
            data: {
              id: 1,
              type: 'profile',
              attributes: { description: 'the desc' },
            },
          },
          mock = mockFindRecord('profile').returns({ json }),
          profileId = mock.get('id');

        FactoryGuy.store
          .findRecord('profile', profileId)
          .then(function (profile) {
            assert.equal(profile.get('id'), profileId);
            assert.equal(profile.get('description'), json.get('description'));
            done();
          });
      });
    });
  });

  module('#mockCreate custom', function () {
    test('match belongsTo with custom payloadKeyFromModelName function', function (assert) {
      run(() => {
        let done = assert.async();

        let entryType = make('entry-type');
        mockCreate('entry').match({ entryType: entryType });

        FactoryGuy.store
          .createRecord('entry', { entryType: entryType })
          .save()
          .then((entry) => {
            assert.equal(entry.get('entryType.id'), entryType.id);
            done();
          });
      });
    });

    test('match hasMany with custom payloadKeyFromModelName function', function (assert) {
      run(() => {
        let done = assert.async();

        let entry = make('entry');
        mockCreate('entry-type').match({ entries: [entry] });

        FactoryGuy.store
          .createRecord('entry-type', { entries: [entry] })
          .save()
          .then((entryType) => {
            let entries = entryType.get('entries');
            assert.deepEqual(entries.mapBy('id'), [entry.id]);
            done();
          });
      });
    });
  });

  module('FactoryGuy#build get', function () {
    test('returns all attributes with no key', function (assert) {
      let user = build('user');
      assert.deepEqual(user.get(), { id: 1, name: 'User1', style: 'normal' });
      assert.equal(user.get().id, 1);
      assert.equal(user.get().name, 'User1');
    });

    test('returns an attribute with a key', function (assert) {
      let user = build('user');
      assert.equal(user.get('id'), 1);
      assert.equal(user.get('name'), 'User1');
    });

    test('returns a relationship with a key', function (assert) {
      let user = build('user', 'with_company');
      assert.deepEqual(user.get('company'), { id: 1, type: 'company' });
    });
  });

  module('FactoryGuy#buildList get', function () {
    test('returns array of all attributes with no key', function (assert) {
      let users = buildList('user', 2);
      assert.deepEqual(users.get(), [
        { id: 1, name: 'User1', style: 'normal' },
        { id: 2, name: 'User2', style: 'normal' },
      ]);
    });

    test('returns an attribute with an index and key', function (assert) {
      let users = buildList('user', 2);
      assert.deepEqual(users.get(0), { id: 1, name: 'User1', style: 'normal' });
      assert.equal(users.get(0).id, 1);
      assert.deepEqual(users.get(1), { id: 2, name: 'User2', style: 'normal' });
      assert.equal(users.get(1).name, 'User2');
    });

    test('returns a relationship with an index and key', function (assert) {
      let user = buildList('user', 2, 'with_company');
      assert.deepEqual(user.get(1).company, { id: 2, type: 'company' });
    });
  });

  module('FactoryGuy#buildList custom', function () {
    test('mock returns inherited models with proper types', function (assert) {
      let list = buildList('hat', 'big', 'small');
      let data = list.data;
      assert.equal(data[0].type, 'small-hat');
      assert.equal(data[1].type, 'big-hat');
    });
  });

  module('FactoryGuy#build custom', function () {
    test('with traits defining model attributes', function (assert) {
      let json = build('project', 'big').data;
      assert.deepEqual(json, {
        id: 1,
        type: 'project',
        attributes: {
          title: 'Big Project',
        },
      });
    });

    test('sideloads belongsTo records which are built from fixture definition', function (assert) {
      let json = build('project', 'with_user');
      json.unwrap();
      assert.deepEqual(json, {
        data: {
          id: 1,
          type: 'project',
          attributes: {
            title: 'Project1',
          },
          relationships: {
            user: {
              data: { id: 1, type: 'user' },
            },
          },
        },
        included: [
          {
            id: 1,
            type: 'user',
            attributes: {
              name: 'User1',
              style: 'normal',
            },
          },
        ],
      });
    });

    test('sideloads belongsTo record passed as ( prebuilt ) json', function (assert) {
      let user = build('user');
      let json = build('project', { user: user });
      json.unwrap();

      assert.deepEqual(json, {
        data: {
          id: 1,
          type: 'project',
          attributes: {
            title: 'Project1',
          },
          relationships: {
            user: {
              data: { id: 1, type: 'user' },
            },
          },
        },
        included: [
          {
            id: 1,
            type: 'user',
            attributes: {
              name: 'User1',
              style: 'normal',
            },
          },
        ],
      });
    });

    test('sideloads many belongsTo records which are built from fixture definition', function (assert) {
      let json = build('project', 'big', 'with_user');
      json.unwrap();
      assert.deepEqual(json, {
        data: {
          id: 1,
          type: 'project',
          attributes: {
            title: 'Big Project',
          },
          relationships: {
            user: {
              data: { id: 1, type: 'user' },
            },
          },
        },
        included: [
          {
            id: 1,
            type: 'user',
            attributes: {
              name: 'User1',
              style: 'normal',
            },
          },
        ],
      });
    });

    test('with more than one trait and custom attributes', function (assert) {
      let json = build('project', 'big', 'with_user', {
        title: 'Crazy Project',
      });
      json.unwrap();
      assert.deepEqual(json, {
        data: {
          id: 1,
          type: 'project',
          attributes: {
            title: 'Crazy Project',
          },
          relationships: {
            user: {
              data: { id: 1, type: 'user' },
            },
          },
        },
        included: [
          {
            id: 1,
            type: 'user',
            attributes: {
              name: 'User1',
              style: 'normal',
            },
          },
        ],
      });
    });

    test('with trait with custom belongsTo association object', function (assert) {
      let json = build('project', 'big', 'with_dude');
      json.unwrap();
      assert.deepEqual(json, {
        data: {
          id: 1,
          type: 'project',
          attributes: {
            title: 'Big Project',
          },
          relationships: {
            user: {
              data: { id: 1, type: 'user' },
            },
          },
        },
        included: [
          {
            id: 1,
            type: 'user',
            attributes: {
              name: 'Dude',
              style: 'normal',
            },
          },
        ],
      });
    });

    test('using trait with attribute using FactoryGuy.belongsTo method', function (assert) {
      let json = build('project', 'with_admin');
      json.unwrap();
      assert.deepEqual(json, {
        data: {
          id: 1,
          type: 'project',
          attributes: {
            title: 'Project1',
          },
          relationships: {
            user: {
              data: { id: 1, type: 'user' },
            },
          },
        },
        included: [
          {
            id: 1,
            type: 'user',
            attributes: {
              name: 'Admin',
              style: 'super',
            },
          },
        ],
      });
    });

    test('with attribute using sequence', function (assert) {
      let json = build('project', 'with_title_sequence');
      json.unwrap();

      assert.deepEqual(json, {
        data: {
          id: 1,
          type: 'project',
          attributes: {
            title: 'Project1',
          },
        },
      });
    });

    test('sideloads hasMany records built from fixture definition', function (assert) {
      let json = build('user', 'with_projects');
      json.unwrap();

      assert.deepEqual(json, {
        data: {
          id: 1,
          type: 'user',
          attributes: {
            name: 'User1',
            style: 'normal',
          },
          relationships: {
            projects: {
              data: [
                { id: 1, type: 'project' },
                { id: 2, type: 'project' },
              ],
            },
          },
        },
        included: [
          {
            id: 1,
            type: 'project',
            attributes: {
              title: 'Project1',
            },
          },
          {
            id: 2,
            type: 'project',
            attributes: {
              title: 'Project2',
            },
          },
        ],
      });
    });

    test('sideloads hasMany records passed as prebuilt ( buildList ) attribute', function (assert) {
      let projects = buildList('project', 2);
      let json = build('user', { projects: projects });
      json.unwrap();

      assert.deepEqual(json, {
        data: {
          id: 1,
          type: 'user',
          attributes: {
            name: 'User1',
            style: 'normal',
          },
          relationships: {
            projects: {
              data: [
                { id: 1, type: 'project' },
                { id: 2, type: 'project' },
              ],
            },
          },
        },
        included: [
          {
            id: 1,
            type: 'project',
            attributes: {
              title: 'Project1',
            },
          },
          {
            id: 2,
            type: 'project',
            attributes: {
              title: 'Project2',
            },
          },
        ],
      });
    });

    test('sideloads hasMany records passed as prebuilt ( array of build ) attribute', function (assert) {
      let project1 = build('project');
      let project2 = build('project');
      let json = build('user', { projects: [project1, project2] });
      json.unwrap();

      assert.deepEqual(json, {
        data: {
          id: 1,
          type: 'user',
          attributes: {
            name: 'User1',
            style: 'normal',
          },
          relationships: {
            projects: {
              data: [
                { id: 1, type: 'project' },
                { id: 2, type: 'project' },
              ],
            },
          },
        },
        included: [
          {
            id: 1,
            type: 'project',
            attributes: {
              title: 'Project1',
            },
          },
          {
            id: 2,
            type: 'project',
            attributes: {
              title: 'Project2',
            },
          },
        ],
      });
    });

    test('creates default json for model', function (assert) {
      let json = build('user');
      json.unwrap();

      assert.deepEqual(json, {
        data: {
          id: 1,
          type: 'user',
          attributes: {
            name: 'User1',
            style: 'normal',
          },
        },
      });
    });

    test('can override default model attributes', function (assert) {
      let json = build('user', { name: 'bob' });
      json.unwrap();

      assert.deepEqual(json, {
        data: {
          id: 1,
          type: 'user',
          attributes: {
            name: 'bob',
            style: 'normal',
          },
        },
      });
    });

    test('can have named model definition with custom attributes', function (assert) {
      let json = build('admin');
      json.unwrap();

      assert.deepEqual(json, {
        data: {
          id: 1,
          type: 'user',
          attributes: {
            name: 'Admin',
            style: 'super',
          },
        },
      });
    });

    test('can override named model attributes', function (assert) {
      let json = build('admin', { name: 'AdminGuy' });
      json.unwrap();

      assert.deepEqual(json, {
        data: {
          id: 1,
          type: 'user',
          attributes: {
            name: 'AdminGuy',
            style: 'super',
          },
        },
      });
    });

    test('ignores transient attributes', function (assert) {
      let json = build('property');
      json.unwrap();

      assert.deepEqual(json, {
        data: {
          id: 1,
          type: 'property',
          attributes: {
            name: 'Silly property',
          },
        },
      });
    });

    test('similar model type ids are created sequentially', function (assert) {
      let user1 = build('user');
      let user2 = build('user');
      let project = build('project');
      assert.equal(user1.data.id, 1);
      assert.equal(user2.data.id, 2);
      assert.equal(project.data.id, 1);
    });

    test('when no custom serialize keys functions exist, dasherizes attributes and relationship keys', function (assert) {
      let json = build('profile', 'with_bat_man');
      json.unwrap();

      assert.deepEqual(json, {
        data: {
          id: 1,
          type: 'profile',
          attributes: {
            description: 'Text goes here',
            'camel-case-description': 'textGoesHere',
            'snake-case-description': 'text_goes_here',
            'a-boolean-field': false,
          },
          relationships: {
            'super-hero': {
              data: { id: 1, type: 'super-hero' },
            },
          },
        },
        included: [
          {
            id: 1,
            type: 'super-hero',
            attributes: {
              name: 'BatMan',
              type: 'SuperHero',
            },
          },
        ],
      });
    });

    // Don't have to duplicate this test on all adapters since it's the same basic idea and not
    // adapter dependent
    test('using custom serialize keys function for transforming attributes and relationship keys', function (assert) {
      let serializer = FactoryGuy.store.serializerFor('profile');

      serializer.keyForAttribute = underscore;
      serializer.keyForRelationship = underscore;

      let json = build('profile', 'with_bat_man');
      json.unwrap();

      assert.deepEqual(json, {
        data: {
          id: 1,
          type: 'profile',
          attributes: {
            description: 'Text goes here',
            camel_case_description: 'textGoesHere',
            snake_case_description: 'text_goes_here',
            a_boolean_field: false,
          },
          relationships: {
            super_hero: {
              data: { id: 1, type: 'super-hero' },
            },
          },
        },
        included: [
          {
            id: 1,
            type: 'super-hero',
            attributes: {
              name: 'BatMan',
              type: 'SuperHero',
            },
          },
        ],
      });
    });

    test('using custom serializer with property forbidden for serialization', function (assert) {
      let date = new Date();
      let serializer = FactoryGuy.store.serializerFor('profile');
      serializer.attrs = {
        created_at: {
          serialize: false,
        },
      };
      let profile = build('profile', 'with_created_at', { created_at: date });
      assert.equal(profile.get('created-at'), date.toJSON());
    });

    test('serializes custom attributes types', function (assert) {
      let info = { first: 1 };
      let json = build('user', { info: info });
      json.unwrap();

      assert.deepEqual(json, {
        data: {
          id: 1,
          type: 'user',
          attributes: {
            name: 'User1',
            style: 'normal',
            info: '{"first":1}',
          },
        },
      });
    });

    test('with (nested json fixture) belongsTo has a hasMany association which has a belongsTo', function (assert) {
      let expectedData = {
        data: {
          type: 'project',
          id: 1,
          attributes: {
            title: 'Project1',
          },
          relationships: {
            user: {
              data: { id: 1, type: 'user' },
            },
          },
        },
        included: [
          {
            type: 'outfit',
            id: 1,
            attributes: {
              name: 'Outfit-1',
            },
          },
          {
            type: 'big-hat',
            id: 1,
            attributes: {
              type: 'BigHat',
            },
            relationships: {
              outfit: {
                data: { id: 1, type: 'outfit' },
              },
            },
          },
          {
            type: 'outfit',
            id: 2,
            attributes: {
              name: 'Outfit-2',
            },
          },
          {
            type: 'big-hat',
            id: 2,
            attributes: {
              type: 'BigHat',
            },
            relationships: {
              outfit: {
                data: { id: 2, type: 'outfit' },
              },
            },
          },
          {
            type: 'user',
            id: 1,
            attributes: {
              name: 'User1',
              style: 'normal',
            },
            relationships: {
              hats: {
                data: [
                  { type: 'big-hat', id: 1 },
                  { type: 'big-hat', id: 2 },
                ],
              },
            },
          },
        ],
      };

      let projectJson = build(
        'project',
        'with_user_having_hats_belonging_to_outfit'
      );
      assert.deepEqual(projectJson.data, expectedData.data);
      assert.deepEqual(projectJson.included, expectedData.included);
    });

    test('#add method sideloads unrelated record passed as prebuilt ( build ) json', function (assert) {
      let batMan = build('bat_man');
      let buildJson = build('user').add(batMan);
      buildJson.unwrap();

      let expectedJson = {
        data: {
          id: 1,
          type: 'user',
          attributes: {
            name: 'User1',
            style: 'normal',
          },
        },
        included: [
          {
            id: 1,
            type: 'super-hero',
            attributes: {
              name: 'BatMan',
              type: 'SuperHero',
            },
          },
        ],
      };

      assert.deepEqual(buildJson, expectedJson);
    });

    test('#add method sideloads unrelated record passed as prebuilt ( buildList ) json', function (assert) {
      let batMen = buildList('bat_man', 2);
      let buildJson = build('user').add(batMen);
      buildJson.unwrap();

      let expectedJson = {
        data: {
          id: 1,
          type: 'user',
          attributes: {
            name: 'User1',
            style: 'normal',
          },
        },
        included: [
          {
            id: 1,
            type: 'super-hero',
            attributes: {
              name: 'BatMan',
              type: 'SuperHero',
            },
          },
          {
            id: 2,
            type: 'super-hero',
            attributes: {
              name: 'BatMan',
              type: 'SuperHero',
            },
          },
        ],
      };

      assert.deepEqual(buildJson, expectedJson);
    });

    // the override for primaryKey is in the helpers/utilityMethods.js
    test('with model that has primaryKey defined in serializer ( FactoryGuy sets primaryKey value )', function (assert) {
      let cat = build('cat');

      assert.equal(cat.get('id'), 1);
    });

    test('with model that has primaryKey defined in serializer ( user sets primaryKey value )', function (assert) {
      let cat = build('cat', { catId: 'meow1' });

      assert.equal(cat.get('id'), 'meow1');
    });

    test('with model that has primaryKey defined in serializer and is attribute ( value set in fixture )', function (assert) {
      let dog = build('dog');

      assert.equal(dog.get('id'), 'Dog1', 'primary key comes from dogNumber');
      assert.equal(
        dog.get('dog-number'),
        'Dog1',
        'attribute has the primary key value as well'
      );
    });

    test('with links for belongsTo relationship', async function (assert) {
      let companyLink = '/user/1/company',
        buildJson = build('user', { links: { company: companyLink } });

      buildJson.unwrap();

      let expectedJson = {
        data: {
          id: 1,
          type: 'user',
          attributes: {
            name: 'User1',
            style: 'normal',
          },
          relationships: {
            company: {
              links: { related: companyLink },
            },
          },
        },
      };

      assert.deepEqual(buildJson, expectedJson);
    });

    test('with links for hasMany relationship', function (assert) {
      let propertyLink = '/user/1/properties',
        buildJson = build('user', { links: { properties: propertyLink } });

      buildJson.unwrap();

      let expectedJson = {
        data: {
          id: 1,
          type: 'user',
          attributes: {
            name: 'User1',
            style: 'normal',
          },
          relationships: {
            properties: {
              links: { related: propertyLink },
            },
          },
        },
      };

      assert.deepEqual(buildJson, expectedJson);
    });
  });
});
