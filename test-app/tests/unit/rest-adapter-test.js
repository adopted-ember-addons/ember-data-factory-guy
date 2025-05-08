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
import SharedAdapterBehavior from './shared-adapter-behaviour';
import { inlineSetup } from '../helpers/utility-methods';

let serializer = 'DS.RESTSerializer';
let serializerType = '-rest';

module(serializer, function (hooks) {
  setupTest(hooks);
  inlineSetup(hooks, serializerType);

  SharedCommonBehavior.all();

  SharedAdapterBehavior.mockFindRecordSideloadingTests();
  SharedAdapterBehavior.mockFindAllSideloadingTests();

  SharedAdapterBehavior.mockFindRecordEmbeddedTests();
  SharedAdapterBehavior.mockFindAllEmbeddedTests();

  SharedAdapterBehavior.mockQueryMetaTests();

  SharedAdapterBehavior.mockUpdateWithErrorMessages();
  SharedAdapterBehavior.mockUpdateReturnsAssociations();
  SharedAdapterBehavior.mockUpdateReturnsEmbeddedAssociations();

  SharedAdapterBehavior.mockCreateReturnsAssociations();
  SharedAdapterBehavior.mockCreateReturnsEmbeddedAssociations();
  SharedAdapterBehavior.mockCreateFailsWithErrorResponse();

  module(`#mockFindRecord custom`, function () {
    test('when returns json (plain) is used', async function (assert) {
      let json = { profile: { id: 1, description: 'the desc' } },
        mock = mockFindRecord('profile').returns({ json }),
        profileId = mock.get('id');

      const profile = await FactoryGuy.store.findRecord('profile', profileId);

      assert.equal(profile.get('id'), profileId);
      assert.equal(profile.get('description'), json.get('description'));
    });
  });

  module(`#mockCreate custom`, function () {
    test('match belongsTo with custom payloadKeyFromModelName function', async function (assert) {
      let entryType = make('entry-type');
      mockCreate('entry').match({ entryType: entryType });

      const entry = await FactoryGuy.store
        .createRecord('entry', { entryType: entryType })
        .save();

      assert.equal(entry.get('entryType.id'), entryType.id);
    });

    test('match hasMany with custom payloadKeyFromModelName function', async function (assert) {
      let entry = make('entry');
      mockCreate('entry-type').match({ entries: [entry] });

      const entryType = await FactoryGuy.store
        .createRecord('entry-type', { entries: [entry] })
        .save();

      let entries = entryType.get('entries');
      assert.deepEqual(entries.mapBy('id'), [entry.id]);
    });
  });
  module(`FactoryGuy#build get`, function () {
    test('returns all attributes with no key', function (assert) {
      let user = build('user');
      assert.deepEqual(user.get(), { id: 1, name: 'User1', style: 'normal' });
      assert.equal(user.get().id, 1);
      assert.equal(user.get().name, 'User1');
    });

    test('returns an attribute for a key', function (assert) {
      let user = build('user');
      assert.equal(user.get('id'), 1);
      assert.equal(user.get('name'), 'User1');
    });

    test('returns a relationship with a key', function (assert) {
      let user = build('user', 'with_company');
      assert.deepEqual(user.get('company'), { id: 1, type: 'company' });
    });
  });

  module(`FactoryGuy#buildList get`, function () {
    test('returns array of all attributes with no key', function (assert) {
      let users = buildList('user', 2);
      assert.deepEqual(users.get(), [
        { id: 1, name: 'User1', style: 'normal' },
        { id: 2, name: 'User2', style: 'normal' },
      ]);
    });

    test('returns an attribute with a key', function (assert) {
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

    // model fragments
    test('with model fragment returns array of all attributes with no key', function (assert) {
      let addresses = buildList('billing-address', 2);
      assert.deepEqual(addresses.get(), [
        {
          street: '1 Sky Cell',
          city: 'Eyre',
          region: 'Vale of Arryn',
          country: 'Westeros',
          billingAddressProperty: 1,
        },
        {
          street: '2 Sky Cell',
          city: 'Eyre',
          region: 'Vale of Arryn',
          country: 'Westeros',
          billingAddressProperty: 2,
        },
      ]);
    });

    // model fragments
    test('with model fragment returns an attribute with a key', function (assert) {
      let addresses = buildList('billing-address', 2);
      assert.deepEqual(addresses.get(0), {
        street: '1 Sky Cell',
        city: 'Eyre',
        region: 'Vale of Arryn',
        country: 'Westeros',
        billingAddressProperty: 1,
      });
      assert.deepEqual(addresses.get(1), {
        street: '2 Sky Cell',
        city: 'Eyre',
        region: 'Vale of Arryn',
        country: 'Westeros',
        billingAddressProperty: 2,
      });
      assert.equal(addresses.get(1).street, '2 Sky Cell');
    });
  });

  module(`FactoryGuy#build custom`, function () {
    test('serializes custom attributes types', function (assert) {
      let info = { first: 1 };
      let buildJson = build('user', { info: info });
      buildJson.unwrap();

      let expectedJson = {
        user: {
          id: 1,
          name: 'User1',
          style: 'normal',
          info: '{"first":1}',
        },
      };

      assert.deepEqual(buildJson, expectedJson);
    });

    test('uses serializers payloadKeyFromModelName function', function (assert) {
      let serializer = FactoryGuy.store.serializerFor('application');
      let savedPayloadKeyFromModelNameFn = serializer.payloadKeyFromModelName;
      serializer.payloadKeyFromModelName = function () {
        return 'dude';
      };

      let buildJson = build('user');
      buildJson.unwrap();

      let expectedJson = {
        dude: {
          id: 1,
          name: 'User1',
          style: 'normal',
        },
      };

      assert.deepEqual(buildJson, expectedJson);

      serializer.payloadKeyFromModelName = savedPayloadKeyFromModelNameFn;
    });

    test('sideloads belongsTo records which are built from fixture definition that just has empty object {}', function (assert) {
      let buildJson = build('user', 'with_company');
      buildJson.unwrap();

      let expectedJson = {
        user: {
          id: 1,
          name: 'User1',
          style: 'normal',
          company: { id: 1, type: 'company' },
        },
        companies: [{ id: 1, type: 'Company', name: 'Silly corp' }],
      };

      assert.deepEqual(buildJson, expectedJson);
    });

    test('sideloads belongsTo records which are built from fixture definition with FactoryGuy.belongsTo', function (assert) {
      let buildJson = build('profile', 'with_bat_man');
      buildJson.unwrap();

      let expectedJson = {
        profile: {
          id: 1,
          description: 'Text goes here',
          camelCaseDescription: 'textGoesHere',
          snake_case_description: 'text_goes_here',
          aBooleanField: false,
          superHero: 1,
        },
        'super-heros': [
          {
            id: 1,
            name: 'BatMan',
            type: 'SuperHero',
          },
        ],
      };

      assert.deepEqual(buildJson, expectedJson);
    });

    test('sideloads belongsTo record passed as ( prebuilt ) json', function (assert) {
      let batMan = build('bat_man');
      let buildJson = build('profile', { superHero: batMan });
      buildJson.unwrap();

      let expectedJson = {
        profile: {
          id: 1,
          description: 'Text goes here',
          camelCaseDescription: 'textGoesHere',
          snake_case_description: 'text_goes_here',
          aBooleanField: false,
          superHero: 1,
        },
        'super-heros': [
          {
            id: 1,
            name: 'BatMan',
            type: 'SuperHero',
          },
        ],
      };

      assert.deepEqual(buildJson, expectedJson);
    });

    test('sideloads 2 levels of relationships ( build => belongsTo , build => belongsTo )', function (assert) {
      let company = build('company');
      let user = build('user', { company });
      let buildJson = build('project', { user });
      buildJson.unwrap();

      let expectedJson = {
        project: {
          id: 1,
          title: 'Project1',
          user: 1,
        },
        users: [
          {
            id: 1,
            name: 'User1',
            company: { id: 1, type: 'company' },
            style: 'normal',
          },
        ],
        companies: [
          {
            id: 1,
            type: 'Company',
            name: 'Silly corp',
          },
        ],
      };

      assert.deepEqual(buildJson, expectedJson);
    });

    test('sideloads 2 levels of records ( buildList => hasMany , build => belongsTo )', function (assert) {
      let hats = buildList('big-hat', 2, 'square');
      let user = build('user', { hats });
      let buildJson = build('project', { user });
      buildJson.unwrap();

      let expectedJson = {
        project: {
          id: 1,
          title: 'Project1',
          user: 1,
        },
        users: [
          {
            id: 1,
            name: 'User1',
            hats: [
              { id: 1, type: 'big-hat' },
              { id: 2, type: 'big-hat' },
            ],
            style: 'normal',
          },
        ],
        'big-hats': [
          {
            id: 1,
            type: 'BigHat',
            shape: 'square',
          },
          {
            id: 2,
            type: 'BigHat',
            shape: 'square',
          },
        ],
      };

      assert.deepEqual(buildJson, expectedJson);
    });

    test('sideloads 2 levels of records ( build => belongsTo,  buildList => hasMany )', function (assert) {
      let company1 = build('company', { name: 'A Corp' });
      let company2 = build('company', { name: 'B Corp' });
      let owners = buildList(
        'user',
        { company: company1 },
        { company: company2 },
      );
      let buildJson = build('property', { owners });
      buildJson.unwrap();

      let expectedJson = {
        property: {
          id: 1,
          name: 'Silly property',
          owners: [1, 2],
        },
        users: [
          {
            id: 1,
            name: 'User1',
            company: { id: 1, type: 'company' },
            style: 'normal',
          },
          {
            id: 2,
            name: 'User2',
            company: { id: 2, type: 'company' },
            style: 'normal',
          },
        ],
        companies: [
          {
            id: 1,
            type: 'Company',
            name: 'A Corp',
          },
          {
            id: 2,
            type: 'Company',
            name: 'B Corp',
          },
        ],
      };

      assert.deepEqual(buildJson, expectedJson);
    });

    test('sideloads hasMany records which are built from fixture definition', function (assert) {
      let buildJson = build('user', 'with_hats');
      buildJson.unwrap();

      let expectedJson = {
        user: {
          id: 1,
          name: 'User1',
          style: 'normal',
          hats: [
            { type: 'big-hat', id: 1 },
            { type: 'big-hat', id: 2 },
          ],
        },
        'big-hats': [
          { id: 1, type: 'BigHat' },
          { id: 2, type: 'BigHat' },
        ],
      };

      assert.deepEqual(buildJson, expectedJson);
    });

    test('sideloads hasMany records passed as prebuilt ( buildList ) json', function (assert) {
      let hats = buildList('big-hat', 2);
      let buildJson = build('user', { hats: hats });
      buildJson.unwrap();

      let expectedJson = {
        user: {
          id: 1,
          name: 'User1',
          style: 'normal',
          hats: [
            { type: 'big-hat', id: 1 },
            { type: 'big-hat', id: 2 },
          ],
        },
        'big-hats': [
          { id: 1, type: 'BigHat' },
          { id: 2, type: 'BigHat' },
        ],
      };

      assert.deepEqual(buildJson, expectedJson);
    });

    test('sideloads hasMany records passed as prebuilt ( array of build ) json', function (assert) {
      let hat1 = build('big-hat');
      let hat2 = build('big-hat');
      let buildJson = build('user', { hats: [hat1, hat2] });
      buildJson.unwrap();

      let expectedJson = {
        user: {
          id: 1,
          name: 'User1',
          style: 'normal',
          hats: [
            { type: 'big-hat', id: 1 },
            { type: 'big-hat', id: 2 },
          ],
        },
        'big-hats': [
          { id: 1, type: 'BigHat' },
          { id: 2, type: 'BigHat' },
        ],
      };

      assert.deepEqual(buildJson, expectedJson);
    });

    test('embeds belongsTo record when serializer attrs => embedded: always ', function (assert) {
      let buildJson = build('comic-book', 'marvel');
      buildJson.unwrap();

      let expectedJson = {
        comicBook: {
          id: 1,
          name: 'Comic Times #1',
          company: { id: 1, type: 'Company', name: 'Marvel Comics' },
        },
      };

      assert.deepEqual(buildJson, expectedJson);
    });

    test('embeds belongsTo record passed as prebuilt ( build ) json when serializer attrs => embedded: always ', function (assert) {
      let marvel = build('marvel');
      let buildJson = build('comic-book', { company: marvel });
      buildJson.unwrap();

      let expectedJson = {
        comicBook: {
          id: 1,
          name: 'Comic Times #1',
          company: { id: 1, type: 'Company', name: 'Marvel Comics' },
        },
      };

      assert.deepEqual(buildJson, expectedJson);
    });

    test('embeds hasMany records when serializer attrs => embedded: always', function (assert) {
      let buildJson = build('comic-book', 'with_included_villains');
      buildJson.unwrap();

      let expectedJson = {
        comicBook: {
          id: 1,
          name: 'Comic Times #1',
          includedVillains: [
            { id: 1, type: 'Villain', name: 'BadGuy#1' },
            { id: 2, type: 'Villain', name: 'BadGuy#2' },
          ],
        },
      };

      assert.deepEqual(buildJson, expectedJson);
    });

    test('embeds polymorphic hasMany records when serializer attrs => embedded: always', function (assert) {
      let buildJson = build('comic-book', 'with_bad_guys');
      buildJson.unwrap();

      let expectedJson = {
        comicBook: {
          id: 1,
          name: 'Comic Times #1',
          characters: [
            { id: 1, type: 'Villain', name: 'BadGuy#1' },
            { id: 2, type: 'Villain', name: 'BadGuy#2' },
          ],
        },
      };

      assert.deepEqual(buildJson, expectedJson);
    });

    test('embeds hasMany records passed as prebuilt ( buildList ) json when serializer attrs => embedded: always', function (assert) {
      let badGuys = buildList('villain', 2);
      let buildJson = build('comic-book', { characters: badGuys });
      buildJson.unwrap();

      let expectedJson = {
        comicBook: {
          id: 1,
          name: 'Comic Times #1',
          characters: [
            { id: 1, type: 'Villain', name: 'BadGuy#1' },
            { id: 2, type: 'Villain', name: 'BadGuy#2' },
          ],
        },
      };

      assert.deepEqual(buildJson, expectedJson);
    });

    test("embeds belongsTo record when serializer attrs => deserialize: 'records' ", function (assert) {
      let buildJson = build('manager', 'withSalary');
      buildJson.unwrap();

      let expectedJson = {
        manager: {
          id: 1,
          name: {
            first_name: 'Tyrion',
            last_name: 'Lannister',
          },
          salary: {
            id: 1,
            income: 90000,
            benefits: ['health', 'company car', 'dental'],
          },
        },
      };

      assert.deepEqual(buildJson, expectedJson);
    });

    test("embeds belongsTo record passed as prebuilt ( build ) json when serializer attrs => deserialize: 'records' ", function (assert) {
      let salary = build('salary');
      let buildJson = build('manager', { salary: salary });
      buildJson.unwrap();

      let expectedJson = {
        manager: {
          id: 1,
          name: {
            first_name: 'Tyrion',
            last_name: 'Lannister',
          },
          salary: {
            id: 1,
            income: 90000,
            benefits: ['health', 'company car', 'dental'],
          },
        },
      };

      assert.deepEqual(buildJson, expectedJson);
    });

    test("embeds hasMany records when serializer attrs => deserialize: 'records'", function (assert) {
      let buildJson = build('manager', 'withReviews');
      buildJson.unwrap();

      let expectedJson = {
        manager: {
          id: 1,
          name: {
            first_name: 'Tyrion',
            last_name: 'Lannister',
          },
          reviews: [
            {
              id: 1,
              rating: 1,
              date: '2015-05-01T00:00:00.000Z',
            },
            {
              id: 2,
              rating: 2,
              date: '2015-05-01T00:00:00.000Z',
            },
          ],
        },
      };

      assert.deepEqual(buildJson, expectedJson);
    });

    test("embeds hasMany records passed as prebuilt ( buildList ) json when serializer attrs => deserialize: 'records'", function (assert) {
      let reviews = buildList('review', 2);
      let buildJson = build('manager', { reviews: reviews });
      buildJson.unwrap();

      let expectedJson = {
        manager: {
          id: 1,
          name: {
            first_name: 'Tyrion',
            last_name: 'Lannister',
          },
          reviews: [
            {
              id: 1,
              rating: 1,
              date: '2015-05-01T00:00:00.000Z',
            },
            {
              id: 2,
              rating: 2,
              date: '2015-05-01T00:00:00.000Z',
            },
          ],
        },
      };

      assert.deepEqual(buildJson, expectedJson);
    });

    test('#add method sideloads unrelated record passed as prebuilt ( build ) json', function (assert) {
      let batMan = build('bat_man');
      let buildJson = build('user').add(batMan);
      buildJson.unwrap();

      let expectedJson = {
        user: {
          id: 1,
          name: 'User1',
          style: 'normal',
        },
        'super-heros': [
          {
            id: 1,
            name: 'BatMan',
            type: 'SuperHero',
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
        user: {
          id: 1,
          name: 'User1',
          style: 'normal',
        },
        'super-heros': [
          {
            id: 1,
            name: 'BatMan',
            type: 'SuperHero',
          },
          {
            id: 2,
            name: 'BatMan',
            type: 'SuperHero',
          },
        ],
      };

      assert.deepEqual(buildJson, expectedJson);
    });

    // duplicate of test in json-api => doing this just for fun ( make extra sure .. though not 100% necessary )
    test('using custom serializer with property forbidden for serialization', function (assert) {
      let date = new Date();
      let serializer = FactoryGuy.store.serializerFor('profile');
      serializer.attrs = {
        created_at: {
          serialize: false,
        },
      };
      let profile = build('profile', 'with_created_at', { created_at: date });
      assert.equal(profile.get('created_at'), date.toJSON());
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
        dog.get('dogNumber'),
        'Dog1',
        'attribute has the primary key value as well',
      );
    });

    test('with links for belongsTo relationship', async function (assert) {
      let companyLink = '/user/1/company',
        buildJson = build('user', { links: { company: companyLink } });

      buildJson.unwrap();

      let expectedJson = {
        user: {
          id: 1,
          name: 'User1',
          style: 'normal',
          links: { company: companyLink },
        },
      };

      assert.deepEqual(buildJson, expectedJson);
    });

    test('with links for hasMany relationship', function (assert) {
      let propertyLink = '/user/1/properties',
        buildJson = build('user', { links: { properties: propertyLink } });

      buildJson.unwrap();

      let expectedJson = {
        user: {
          id: 1,
          name: 'User1',
          style: 'normal',
          links: { properties: propertyLink },
        },
      };

      assert.deepEqual(buildJson, expectedJson);
    });
  });

  module(`FactoryGuy#buildList custom`, function () {
    test('sideloads belongsTo records', function (assert) {
      let buildJson = buildList('profile', 2, 'with_bat_man');
      buildJson.unwrap();

      let expectedJson = {
        profiles: [
          {
            id: 1,
            description: 'Text goes here',
            camelCaseDescription: 'textGoesHere',
            snake_case_description: 'text_goes_here',
            aBooleanField: false,
            superHero: 1,
          },
          {
            id: 2,
            description: 'Text goes here',
            camelCaseDescription: 'textGoesHere',
            snake_case_description: 'text_goes_here',
            aBooleanField: false,
            superHero: 2,
          },
        ],
        'super-heros': [
          {
            id: 1,
            name: 'BatMan',
            type: 'SuperHero',
          },
          {
            id: 2,
            name: 'BatMan',
            type: 'SuperHero',
          },
        ],
      };

      assert.deepEqual(buildJson, expectedJson);
    });

    test('sideloads hasMany records', function (assert) {
      let buildJson = buildList('user', 2, 'with_hats');
      buildJson.unwrap();

      let expectedJson = {
        users: [
          {
            id: 1,
            name: 'User1',
            style: 'normal',
            hats: [
              { type: 'big-hat', id: 1 },
              { type: 'big-hat', id: 2 },
            ],
          },
          {
            id: 2,
            name: 'User2',
            style: 'normal',
            hats: [
              { type: 'big-hat', id: 3 },
              { type: 'big-hat', id: 4 },
            ],
          },
        ],
        'big-hats': [
          { id: 1, type: 'BigHat' },
          { id: 2, type: 'BigHat' },
          { id: 3, type: 'BigHat' },
          { id: 4, type: 'BigHat' },
        ],
      };

      assert.deepEqual(buildJson, expectedJson);
    });

    test('handles self referential parent child relationship', function (assert) {
      let parent = build('group', 'parent');
      let buildJson = buildList('group', 1, { group: parent });

      buildJson.unwrap();

      let expectedJson = {
        groups: [
          {
            group: {
              id: 1,
              type: 'group',
            },
            id: 2,
            name: 'Group-2',
            type: 'Group',
          },
          {
            group: undefined,
            id: 1,
            name: 'Parent Group',
            type: 'Group',
          },
        ],
      };

      assert.deepEqual(buildJson, expectedJson);
    });
  });
});
