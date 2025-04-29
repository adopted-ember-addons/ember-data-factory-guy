import { all } from 'rsvp';
import { A } from '@ember/array';
import { run } from '@ember/runloop';
import { module, test } from 'qunit';
import { isEquivalent } from 'ember-data-factory-guy/utils/helper-functions';

import FactoryGuy, {
  build,
  buildList,
  make,
  makeList,
  makeNew,
  mockCreate,
  mockDelete,
  mockFindAll,
  mockFindRecord,
  mockQuery,
  mockQueryRecord,
  mockReload,
  mockUpdate,
} from 'ember-data-factory-guy';

import Profile from 'dummy/models/profile';
import SuperHero from 'dummy/models/super-hero';

let SharedBehavior = {};

//////// mockFindRecord common /////////
SharedBehavior.mockFindRecordCommonTests = function () {
  test('the basic returns default attributes', async function (assert) {
    const mockFindProfile = mockFindRecord('profile'),
      profileId = mockFindProfile.get('id');

    const profile = await FactoryGuy.store.findRecord('profile', profileId);
    assert.equal(profile.id, profileId);
    assert.equal(profile.get('description'), 'Text goes here');
  });

  test('when returns json is used', async function (assert) {
    let json = build('profile'),
      mockFindProfile = mockFindRecord('profile').returns({ json }),
      profileId = mockFindProfile.get('id');

    let profile = await FactoryGuy.store.findRecord('profile', profileId);
    assert.equal(profile.get('id'), profileId);
    assert.equal(profile.get('description'), json.get('description'));
  });

  test('returns id succeeds and returns model when id for model type found in store after createRecord', async function (assert) {
    let profileId = 1,
      { store } = FactoryGuy;

    mockCreate('profile').returns({ attrs: { id: profileId } });

    let newRecord = store.createRecord('profile', { description: 'foo' });
    let newProfile = await newRecord.save();

    mockFindRecord('profile').returns({ id: newProfile.id });

    let foundRecord = await store.findRecord('profile', newProfile.id);

    assert.deepEqual(foundRecord, newProfile);
  });

  test('returns id succeeds and returns model when id for model type found in store', async function (assert) {
    let existingProfile = make('profile'),
      { store } = FactoryGuy;

    mockFindRecord('profile').returns({ id: existingProfile.get('id') });

    let profile = await store.findRecord('profile', existingProfile.get('id'));

    assert.equal(profile.get('id'), existingProfile.get('id'));
  });

  test('returns id fails with 404 if record for id and model type not found in store', async function (assert) {
    let profileId = 1;
    mockFindRecord('profile').returns({ id: profileId });

    await FactoryGuy.store.findRecord('profile', profileId).catch((reason) => {
      assert.equal(reason.errors[0].status, '404');
    });
  });

  //    test("returns model succeeds", async function(assert) {
  //        let cat = make('cat', { type: 'Cutest' });
  //        let mock = mockFindRecord(cat);//.returns({ model: cat });
  //
  //        FactoryGuy.store.findRecord('cat', mock.get('id'), { reload: true }).then(function(catA) {
  //          assert.equal(catA.get('type'), 'Cutest');
  //        });
  //      });

  //  test("with model that has attribute named type, is not polymorphic, and returns model", function(assert) {
  //    run(() => {
  //      let done = assert.async();
  //      let cat = make('cat', { type: 'Cutest' });
  //      let mock = mockFindRecord(cat);//.returns({ model: cat });
  //      console.log(mock.index, cat.get('id'));
  //      FactoryGuy.store.findRecord('cat', mock.get('id'), { reload: true }).then(function(catA) {
  //        assert.equal(catA.get('type'), 'Cutest');
  //        done();
  //      });
  //    });
  //  });

  test('returns model that has attribute named type, but is not polymorphic', async function (assert) {
    let cat = make('cat', { type: 'Cutest' });
    let mock = mockFindRecord('cat').returns({ model: cat });

    let catA = await FactoryGuy.store.findRecord('cat', mock.get('id'), {
      reload: true,
    });
    assert.equal(catA.get('type'), 'Cutest');
  });

  test('when using model as the param of modelName to find record', async function (assert) {
    let cat = make('cat'),
      mock = mockFindRecord(cat);

    let catA = await FactoryGuy.store.findRecord('cat', mock.get('id'), {
      reload: true,
    });
    assert.deepEqual(catA, cat);
  });

  // test for issue # 219
  test('with model that has attribute key defined in serializer attrs', async function (assert) {
    let mock = mockFindRecord('cat');

    assert.equal(mock.get('catName'), 'Cat 1');
    assert.equal(mock.get('catFriend'), 'Friend 1');

    const cat = await FactoryGuy.store.findRecord('cat', mock.get('id'));
    assert.equal(cat.get('name'), 'Cat 1');
    assert.equal(cat.get('friend'), 'Friend 1');
  });

  test('with model that has primaryKey defined in serializer attrs and is attribute of model', async function (assert) {
    let mock = mockFindRecord('dog');

    const dog = await FactoryGuy.store.findRecord('dog', mock.get('id'));
    assert.equal(dog.get('id'), 'Dog1');
    assert.equal(dog.get('dogNumber'), 'Dog1');
  });

  test('with fixture options', async function (assert) {
    let mock = mockFindRecord('profile', { description: 'dude' });
    let profileId = mock.get('id');

    const profile = await FactoryGuy.store.findRecord('profile', profileId);
    assert.ok(profile.get('description') === 'dude');
  });

  test('handles differently cased attributes', async function (assert) {
    let mock = mockFindRecord('profile');
    let profileId = mock.get('id');

    const profile = await FactoryGuy.store.findRecord('profile', profileId);

    assert.ok(profile.get('camelCaseDescription') === 'textGoesHere');
    assert.ok(profile.get('snake_case_description') === 'text_goes_here');
  });

  test('with traits', async function (assert) {
    let mock = mockFindRecord('profile', 'goofy_description');
    let profileId = mock.get('id');

    const profile = await FactoryGuy.store.findRecord('profile', profileId);
    assert.ok(profile.get('description') === 'goofy');
  });

  test('with traits and extra options', async function (assert) {
    let mock = mockFindRecord('profile', 'goofy_description', {
      description: 'dude',
    });
    let profileId = mock.get('id');

    const profile = await FactoryGuy.store.findRecord('profile', profileId);
    assert.ok(profile.get('description') === 'dude');
  });

  test('failure with fails method when passing modelName as parameter', async function (assert) {
    let mock = mockFindRecord('profile').fails();
    await FactoryGuy.store.findRecord('profile', mock.get('id')).catch(() => {
      assert.equal(mock.timesCalled, 1);
    });
  });

  test('failure with fails method when passing modeName as parameter and returning instance', async function (assert) {
    let model = make('profile');
    let mock = mockFindRecord('profile').returns({ model }).fails();

    await FactoryGuy.store
      .findRecord('profile', model.id, { reload: true })
      .catch(() => {
        assert.equal(mock.timesCalled, 1);
        assert.equal(mock.status, 500);
      });
  });

  test('failure with fails method when passing model instance as parameter and no returns is used', async function (assert) {
    let profile = make('profile');
    let mock = mockFindRecord(profile).fails();
    await FactoryGuy.store
      .findRecord('profile', profile.id, { reload: true })
      .catch(() => {
        assert.equal(mock.timesCalled, 1, 'mock called once');
        assert.equal(mock.status, 500, 'stats 500');
      });
  });
};

SharedBehavior.mockFindRecordSideloadingTests = function () {
  module('#mockFindRecord | sideloading', function () {
    test('belongsTo association', async function (assert) {
      let mockFindProfile = mockFindRecord(
        'profile',
        'with_company',
        'with_bat_man'
      );
      let profileId = mockFindProfile.get('id');

      const profile = await FactoryGuy.store.findRecord('profile', profileId);
      assert.ok(profile.get('company.name') === 'Silly corp');
      assert.ok(profile.get('superHero.name') === 'BatMan');
    });

    test('hasMany association', async function (assert) {
      let mockFindUser = mockFindRecord('user', 'with_hats');
      let userId = mockFindUser.get('id');

      let user = await FactoryGuy.store.findRecord('user', userId);

      assert.equal(user.get('hats.length'), 2);
      assert.equal(user.get('hats.firstObject.type'), 'BigHat');
    });

    test('using returns with json', async function (assert) {
      let json = build('profile', 'with_company', 'with_bat_man');

      mockFindRecord('profile').returns({ json });
      let profileId = json.get('id');

      const profile = await FactoryGuy.store.findRecord('profile', profileId);

      assert.equal(profile.get('company.name'), 'Silly corp');
      assert.equal(profile.get('superHero.name'), 'BatMan');
    });

    test('using returns with json with composed hasMany association', async function (assert) {
      let hat1 = build('big-hat');
      let hat2 = build('big-hat');
      let json = build('user', { hats: [hat1, hat2] });

      mockFindRecord('user').returns({ json });

      const user = await FactoryGuy.store.findRecord('user', json.get('id'));
      assert.ok(user.get('hats.firstObject.id') === hat1.get('id') + '');
      assert.ok(user.get('hats.lastObject.id') === hat2.get('id') + '');
    });

    test('using returns with model', async function (assert) {
      let model = make('profile', 'with_company', 'with_bat_man');
      let mockFindProfile = mockFindRecord('profile').returns({ model });
      let profileId = mockFindProfile.get('id');

      const profile = await FactoryGuy.store.findRecord('profile', profileId, {
        reload: true,
      });
      assert.equal(profile.get('company.name'), 'Silly corp');
      assert.equal(profile.get('superHero.name'), 'BatMan');
      assert.equal(
        FactoryGuy.store.peekAll('profile').get('content').length,
        1,
        'does not make another profile'
      );
    });
  });
};

SharedBehavior.mockFindRecordEmbeddedTests = function () {
  module('#mockFindRecord | embedded', async function () {
    test('belongsTo', async function (assert) {
      let mock = mockFindRecord('comic-book', 'marvel');

      const comic = await FactoryGuy.store.findRecord(
        'comic-book',
        mock.get('id')
      );
      assert.ok(comic.get('name') === 'Comic Times #1');
      assert.ok(comic.get('company.name') === 'Marvel Comics');
    });

    test('hasMany', async function (assert) {
      let mock = mockFindRecord('comic-book', 'with_bad_guys');

      const comic = await FactoryGuy.store.findRecord(
        'comic-book',
        mock.get('id')
      );
      assert.ok(comic.get('name') === 'Comic Times #1');
      assert.ok(
        comic.get('characters').mapBy('name') + '' ===
          ['BadGuy#1', 'BadGuy#2'] + ''
      );
    });
  });
};

//////// mockReload /////////

SharedBehavior.mockReloadTests = function () {
  test('with a record handles reload, and does not change attributes', async function (assert) {
    let profile = make('profile', { description: 'whatever' });
    mockReload(profile);

    const reloaded = await profile.reload();
    assert.ok(reloaded.id === profile.id);
    assert.ok(reloaded.get('description') === profile.get('description'));
  });

  test('can change the attributes using returns method with attrs', async function (assert) {
    let profile = make('profile', {
      description: 'whatever',
      camelCaseDescription: 'noodles',
    });

    mockReload(profile).returns({ attrs: { description: 'moo' } });

    const reloaded = await profile.reload();
    assert.ok(reloaded.id === profile.id, 'does not change id');
    assert.ok(reloaded.get('description') === 'moo', 'attribute changed');
    assert.ok(
      reloaded.get('camelCaseDescription') === 'noodles',
      'other attributes are same'
    );
  });

  test('using returns method with json', async function (assert) {
    let profile = make('profile', {
      description: 'tomatoes',
      camelCaseDescription: 'noodles',
    });

    let newProfile = build('profile', {
      id: profile.get('id'),
      description: 'potatoes',
      camelCaseDescription: 'poodles',
    });
    mockReload(profile).returns({ json: newProfile });

    const reloaded = await profile.reload();
    assert.ok(reloaded.id === profile.id, 'does not change id');
    assert.ok(
      reloaded.get('description') === 'potatoes',
      'description changed'
    );
    assert.ok(
      reloaded.get('camelCaseDescription') === 'poodles',
      'camelCaseDescription changes'
    );
  });

  test('failure with fails method', async function (assert) {
    let mock = mockReload('profile', 1).fails();

    await FactoryGuy.store.findRecord('profile', 1).catch(() => {
      assert.equal(mock.timesCalled, 1);
      assert.ok(true);
    });
  });
};

/////// mockFindAll common //////////
SharedBehavior.mockFindAllCommonTests = function () {
  test('the basic', async function (assert) {
    mockFindAll('user', 2);

    let users = await FactoryGuy.store.findAll('user');
    assert.ok(users.get('length') === 2);
  });

  test('handles differently cased attributes', async function (assert) {
    mockFindAll('profile', 1);

    let profiles = await FactoryGuy.store.findAll('profile');
    assert.ok(
      profiles.get('firstObject.camelCaseDescription') === 'textGoesHere'
    );
    assert.ok(
      profiles.get('firstObject.snake_case_description') === 'text_goes_here'
    );
  });

  test('asking for no return records', async function (assert) {
    mockFindAll('user', 0);

    const profiles = await FactoryGuy.store.findAll('user');
    assert.ok(profiles.get('length') === 0);
  });

  test('with fixture options', async function (assert) {
    mockFindAll('profile', 2, { description: 'dude' });

    const profiles = await FactoryGuy.store.findAll('profile');
    assert.ok(profiles.get('length') === 2);
    assert.ok(profiles.get('firstObject.description') === 'dude');
  });

  test('with traits', async function (assert) {
    mockFindAll('profile', 2, 'goofy_description');

    const profiles = await FactoryGuy.store.findAll('profile');
    assert.ok(profiles.get('length') === 2);
    assert.ok(profiles.get('firstObject.description') === 'goofy');
  });

  test('with traits and extra options', async function (assert) {
    mockFindAll('profile', 2, 'goofy_description', { description: 'dude' });

    const profiles = await FactoryGuy.store.findAll('profile');
    assert.ok(profiles.get('length') === 2);
    assert.ok(profiles.get('firstObject.description') === 'dude');
  });
};

//////// mockFindAll with sideloading /////////
SharedBehavior.mockFindAllSideloadingTests = function () {
  module('#mockFindAll | sideloading', function () {
    test('with belongsTo association', async function (assert) {
      mockFindAll('profile', 2, 'with_company', 'with_bat_man');

      const profiles = await FactoryGuy.store.findAll('profile');
      assert.ok(profiles.get('length') === 2);
      assert.ok(profiles.get('firstObject.company.name') === 'Silly corp');
      assert.ok(profiles.get('lastObject.superHero.name') === 'BatMan');
    });

    test('with hasMany association', async function (assert) {
      mockFindAll('user', 2, 'with_hats');

      const users = await FactoryGuy.store.findAll('user');
      assert.ok(users.get('length') === 2);
      assert.ok(
        A(users.get('lastObject.hats')).mapBy('type') + '' ===
          ['BigHat', 'BigHat'] + ''
      );
      assert.ok(
        A(users.get('lastObject.hats')).mapBy('id') + '' === [3, 4] + ''
      );
    });

    test('with diverse models', async function (assert) {
      mockFindAll('profile', 'goofy_description', { description: 'foo' }, [
        'goofy_description',
        { aBooleanField: true },
      ]);

      const profiles = await FactoryGuy.store.findAll('profile');
      assert.ok(profiles.get('length') === 3);
      assert.ok(A(profiles).objectAt(0).get('description') === 'goofy');
      assert.ok(A(profiles).objectAt(0).get('aBooleanField') === false);
      assert.ok(A(profiles).objectAt(1).get('description') === 'foo');
      assert.ok(A(profiles).objectAt(1).get('aBooleanField') === false);
      assert.ok(A(profiles).objectAt(2).get('description') === 'goofy');
      assert.ok(A(profiles).objectAt(2).get('aBooleanField') === true);
    });

    test('using returns with json', async function (assert) {
      let json = buildList('profile', 'with_company', 'with_bat_man');
      mockFindAll('profile').returns({ json });

      const profiles = await FactoryGuy.store.findAll('profile');
      assert.ok(profiles.get('firstObject.company.name') === 'Silly corp');
      assert.ok(profiles.get('lastObject.superHero.name') === 'BatMan');
    });

    test('using returns with model', async function (assert) {
      let models = makeList('profile', 'with_company', 'with_bat_man');
      mockFindAll('profile').returns({ models });

      const profiles = await FactoryGuy.store.findAll('profile');
      assert.ok(profiles.get('firstObject.company.name') === 'Silly corp');
      assert.ok(profiles.get('lastObject.superHero.name') === 'BatMan');
      assert.equal(
        FactoryGuy.store.peekAll('profile').get('content').length,
        2,
        'does not make new profiles'
      );
    });

    // TODO: need to put included models into included section of json
    //    test("handles include params", async function(assert) {
    //      let json = buildList('profile', 'with_company');
    //      mockFindAll('profile').withParams({include: 'company'}).returns({json});
    //
    //      const profiles = FactoryGuy.store.findAll('profile', {include: 'company'});
    //      assert.ok(profiles.get('firstObject.company.name') === 'Silly corp');
    //    });
  });
};

SharedBehavior.mockFindAllEmbeddedTests = function () {
  module('#mockFindAll | embedded', function () {
    test('belongsTo', async function (assert) {
      mockFindAll('comic-book', 2, 'marvel');

      const comics = await FactoryGuy.store.findAll('comic-book');
      assert.ok(
        comics.mapBy('name') + '' === ['Comic Times #1', 'Comic Times #2'] + ''
      );
      assert.ok(
        comics.mapBy('company.name') + '' ===
          ['Marvel Comics', 'Marvel Comics'] + ''
      );
    });

    test('hasMany', async function (assert) {
      mockFindAll('comic-book', 2, 'with_bad_guys');

      const comics = await FactoryGuy.store.findAll('comic-book');
      assert.ok(
        comics.mapBy('name') + '' === ['Comic Times #1', 'Comic Times #2'] + ''
      );
      assert.ok(
        comics.get('firstObject.characters').mapBy('name') + '' ===
          ['BadGuy#1', 'BadGuy#2'] + ''
      );
      assert.ok(
        comics.get('lastObject.characters').mapBy('name') + '' ===
          ['BadGuy#3', 'BadGuy#4'] + ''
      );
    });
  });
};

/////// mockQuery //////////

SharedBehavior.mockQueryTests = function () {
  test('not using returns', async function (assert) {
    mockQuery('user', { name: 'Bob' });

    const users = await FactoryGuy.store.query('user', { name: 'Bob' });
    assert.equal(users.get('length'), 0, 'nothing returned');
  });

  test('with no parameters matches query with any parameters', async function (assert) {
    mockQuery('user');
    await FactoryGuy.store.query('user', { name: 'Bob' });
    assert.ok(true);
  });

  test('using fails makes the request fail', async function (assert) {
    let errors = { errors: { name: ['wrong'] } };

    let mock = mockQuery('user').fails({ status: 422, response: errors });
    await FactoryGuy.store.query('user', {}).catch(() => {
      assert.equal(mock.timesCalled, 1);
      assert.ok(true);
    });
  });

  test('using nested search params', async function (assert) {
    let models = makeList('company', 2);

    mockQuery('company', { name: { like: 'Dude*' } }).returns({ models });

    const companies = await FactoryGuy.store.query('company', {
      name: { like: 'Dude*' },
    });
    assert.deepEqual(A(companies).mapBy('id'), A(models).mapBy('id'));
  });

  test('using returns with empty array', async function (assert) {
    mockQuery('user', { name: 'Bob' }).returns({ models: [] });
    const users = await FactoryGuy.store.query('user', { name: 'Bob' });
    assert.equal(users.get('length'), 0, 'nothing returned');
  });

  test('using returns with model instances returns your models, and does not create new ones', async function (assert) {
    let bob = make('user');

    mockQuery('user', { name: 'Bob' }).returns({ models: [bob] });

    const users = await FactoryGuy.store.query('user', { name: 'Bob' });
    assert.equal(users.get('length'), 1);
    assert.equal(users.get('firstObject'), bob);
    assert.equal(
      FactoryGuy.store.peekAll('user').get('content').length,
      1,
      'does not make another user'
    );
  });

  test('using returns with model instances having hasMany models', async function (assert) {
    let models = makeList('user', 2, 'with_hats');
    mockQuery('user', { name: 'Bob' }).returns({ models });

    assert.equal(
      FactoryGuy.store.peekAll('user').get('content.length'),
      2,
      'start out with 2 instances'
    );

    let users = await FactoryGuy.store.query('user', { name: 'Bob' });
    assert.equal(users.get('length'), 2);
    assert.equal(users.get('firstObject.name'), 'User1');
    assert.equal(users.get('firstObject.hats.length'), 2);
    assert.equal(users.get('lastObject.name'), 'User2');
    assert.equal(
      FactoryGuy.store.peekAll('user').get('content.length'),
      2,
      'no new instances created'
    );
  });

  test('using returns with model instances with hasMany and belongsTo relationships', async function (assert) {
    let models = makeList('company', 2, 'with_projects', 'with_profile');
    mockQuery('company', { name: 'Dude Company' }).returns({ models });

    assert.equal(
      FactoryGuy.store.peekAll('company').get('content.length'),
      2,
      'start out with 2 instances'
    );

    const companies = await FactoryGuy.store.query('company', {
      name: 'Dude Company',
    });
    assert.equal(companies.get('length'), 2);
    assert.ok(companies.get('firstObject.profile') instanceof Profile);
    assert.equal(companies.get('firstObject.projects.length'), 2);
    assert.ok(companies.get('lastObject.profile') instanceof Profile);
    assert.equal(companies.get('lastObject.projects.length'), 2);
    assert.equal(
      FactoryGuy.store.peekAll('company').get('content.length'),
      2,
      'no new instances created'
    );
  });

  test('using returns with json returns and creates models', async function (assert) {
    let json = buildList('user', 1);
    mockQuery('user', { name: 'Bob' }).returns({ json });

    const users = await FactoryGuy.store.query('user', { name: 'Bob' });
    assert.equal(users.get('length'), 1);
    // makes the user after getting query response
    assert.equal(FactoryGuy.store.peekAll('user').get('content').length, 1);
  });

  test('using returns with model ids returns those models and does not create new ones', async function (assert) {
    let bob = make('user');
    let ids = [bob.id];
    mockQuery('user', { name: 'Bob' }).returns({ ids });

    const users = await FactoryGuy.store.query('user', { name: 'Bob' });
    assert.equal(users.get('length'), 1);
    assert.equal(users.get('firstObject'), bob);
    // does not create a new model
    assert.equal(FactoryGuy.store.peekAll('user').get('content').length, 1);
  });

  // test created for issue #143
  test('reuse mock query to first return nothing then use returns to return something', async function (assert) {
    let store = FactoryGuy.store;

    let bobQueryHander = mockQuery('user', { name: 'Bob' });

    let users = await store.query('user', { name: 'Bob' });
    assert.equal(users.get('length'), 0);

    mockCreate('user', { name: 'Bob' });
    const user = await store.createRecord('user', { name: 'Bob' }).save();

    bobQueryHander.returns({ models: [user] });

    users = await store.query('user', { name: 'Bob' });
    assert.equal(users.get('length'), 1);
  });

  test('reusing mock query using returns with different models and different params returns different results', async function (assert) {
    let companies1 = makeList('company', 2);
    mockQuery('company', { name: 'Dude' }).returns({ models: companies1 });

    let companies2 = makeList('company', 2);
    mockQuery('company', { type: 'Small' }).returns({ models: companies2 });

    let companies = await FactoryGuy.store.query('company', { name: 'Dude' });
    assert.equal(A(companies).mapBy('id') + '', A(companies1).mapBy('id') + '');

    companies = await FactoryGuy.store.query('company', { type: 'Small' });
    assert.equal(A(companies).mapBy('id') + '', A(companies2).mapBy('id') + '');
  });

  test('using returns with same json and different query params returns same results', async function (assert) {
    let companies = makeList('company', 2);

    mockQuery('company', { name: 'Dude' }).returns({ models: companies });

    let returnedCompanies = await FactoryGuy.store.query('company', {
      name: 'Dude',
    });
    assert.equal(
      A(companies).mapBy('id') + '',
      A(returnedCompanies).mapBy('id') + ''
    );

    mockQuery('company', { type: 'Small', name: 'Dude' }).returns({
      models: companies,
    });

    returnedCompanies = await FactoryGuy.store.query('company', {
      type: 'Small',
      name: 'Dude',
    });
    assert.equal(
      A(companies).mapBy('id') + '',
      A(returnedCompanies).mapBy('id') + ''
    );
  });

  test('reusing mock query using returns with different models and withParams with different params returns different results', async function (assert) {
    let companies1 = makeList('company', 2);
    let companies2 = makeList('company', 2);

    let queryHandler = mockQuery('company', { name: 'Dude' }).returns({
      models: companies1,
    });
    let companies = await FactoryGuy.store.query('company', { name: 'Dude' });
    assert.equal(A(companies).mapBy('id') + '', A(companies1).mapBy('id') + '');

    queryHandler.withParams({ type: 'Small' }).returns({ models: companies2 });
    companies = await FactoryGuy.store.query('company', { type: 'Small' });
    assert.equal(A(companies).mapBy('id') + '', A(companies2).mapBy('id') + '');
  });

  test('mock query with withSomeParams captures the query even if it contains additional params', async function (assert) {
    let companies1 = makeList('company', 2);
    let companies2 = makeList('company', 2);

    let matchQueryHandler = mockQuery('company')
      .withSomeParams({ name: 'Dude' })
      .returns({ models: companies1 });
    let allQueryHandler = mockQuery('company').returns({ models: companies2 });

    let companies = await FactoryGuy.store.query('company', {
      name: 'Dude',
      page: 1,
    });
    assert.equal(A(companies).mapBy('id') + '', A(companies1).mapBy('id') + '');
    assert.equal(matchQueryHandler.timesCalled, 1);
    companies = await FactoryGuy.store.query('company', {
      name: 'Other',
      page: 1,
    });
    assert.equal(A(companies).mapBy('id') + '', A(companies2).mapBy('id') + '');
    assert.equal(allQueryHandler.timesCalled, 1);
  });
};

SharedBehavior.mockQueryMetaTests = function () {
  module('#mockQuery | meta', function () {
    test('with proxy payload', async function (assert) {
      let json1 = buildList('profile', 2).add({
        meta: { previous: '/profiles?page=1', next: '/profiles?page=3' },
      });
      let json2 = buildList('profile', 2).add({
        meta: { previous: '/profiles?page=2', next: '/profiles?page=4' },
      });

      mockQuery('profile', { page: 2 }).returns({ json: json1 });
      mockQuery('profile', { page: 3 }).returns({ json: json2 });

      let profiles = await FactoryGuy.store.query('profile', { page: 2 });
      assert.deepEqual(profiles.mapBy('id'), ['1', '2']);
      assert.ok(
        isEquivalent(profiles.get('meta'), {
          previous: '/profiles?page=1',
          next: '/profiles?page=3',
        })
      );

      let profiles2 = await FactoryGuy.store.query('profile', { page: 3 });
      assert.deepEqual(profiles2.mapBy('id'), ['3', '4']);
      assert.ok(
        isEquivalent(profiles2.get('meta'), {
          previous: '/profiles?page=2',
          next: '/profiles?page=4',
        })
      );
    });
  });
};

/////// mockQueryRecord //////////

SharedBehavior.mockQueryRecordTests = function () {
  test('when returning no result', async function (assert) {
    mockQueryRecord('user');

    FactoryGuy.store.queryRecord('user', {});

    assert.ok(true);
  });

  test('with no parameters matches queryRequest with any parameters', async function (assert) {
    mockQueryRecord('user').returns({ json: build('user') });

    await FactoryGuy.store.queryRecord('user', { name: 'Bob' });

    assert.ok(true);
  });

  test('using returns with json returns and creates model', async function (assert) {
    let bob = build('user', { name: 'Bob' });
    mockQueryRecord('user', { name: 'Bob' }).returns({ json: bob });

    let user = await FactoryGuy.store.queryRecord('user', { name: 'Bob' });
    assert.equal(user.id, bob.get('id'));
    assert.equal(user.get('name'), bob.get('name'));
    // makes the user after getting query response
    assert.equal(FactoryGuy.store.peekAll('user').get('content').length, 1);
  });

  test('using returns with model instance returns that model, and does not create new one', async function (assert) {
    let bob = make('user');
    mockQueryRecord('user', { name: 'Bob' }).returns({ model: bob });

    let user = await FactoryGuy.store.queryRecord('user', { name: 'Bob' });
    assert.equal(user, bob, 'returns the same user');
    assert.equal(
      FactoryGuy.store.peekAll('user').get('content').length,
      1,
      'does not create a new model'
    );
  });

  test('using returns with model id returns that model, and does not create new one', async function (assert) {
    let bob = make('user');
    mockQueryRecord('user', { name: 'Bob' }).returns({ id: bob.id });

    let user = await FactoryGuy.store.queryRecord('user', { name: 'Bob' });
    assert.equal(user, bob, 'returns the same user');
    assert.equal(
      FactoryGuy.store.peekAll('user').get('content').length,
      1,
      'does not create a new model'
    );
  });

  test('twice using returns with different json and different params returns different results', async function (assert) {
    let company1 = build('company'),
      company2 = build('company');

    mockQueryRecord('company', { name: 'Dude' }).returns({ json: company1 });
    mockQueryRecord('company', { type: 'Small' }).returns({ json: company2 });

    let company = await FactoryGuy.store.queryRecord('company', {
      name: 'Dude',
    });
    assert.equal(company.get('id'), company1.get('id'));

    company = await FactoryGuy.store.queryRecord('company', { type: 'Small' });
    assert.equal(company.get('id'), company2.get('id'));
  });

  test('reusing mock using returns with different json and withParams with different params returns different results', async function (assert) {
    let company1 = build('company'),
      company2 = build('company');

    let mockQuery = mockQueryRecord('company', { name: 'Dude' }).returns({
      json: company1,
    });
    let company = await FactoryGuy.store.queryRecord('company', {
      name: 'Dude',
    });

    assert.equal(company.get('id'), company1.get('id'));

    mockQuery.withParams({ type: 'Small' }).returns({ json: company2 });
    company = await FactoryGuy.store.queryRecord('company', { type: 'Small' });

    assert.equal(company.get('id'), company2.get('id'));
  });
};

/////// mockCreate //////////

SharedBehavior.mockCreateTests = function () {
  test('the basic with model name', async function (assert) {
    let customDescription = 'special description';

    mockCreate('profile').match({ description: customDescription });

    assert.ok(FactoryGuy.store.peekAll('profile').get('content.length') === 0);

    let profile = FactoryGuy.store.createRecord('profile', {
      description: customDescription,
    });
    await profile.save();

    assert.ok(
      FactoryGuy.store.peekAll('profile').get('content.length') === 1,
      'No extra records created'
    );
    assert.ok(profile instanceof Profile, 'Creates the correct type of record');
    assert.ok(
      profile.get('description') === customDescription,
      'Passes along the match attributes'
    );
  });

  test('the basic with new model', async function (assert) {
    let description = 'special description',
      camelCaseDescription = 'special camelcase description',
      profile = makeNew('profile', { description, camelCaseDescription });

    mockCreate(profile).match({ camelCaseDescription, description });
    await profile.save();

    assert.ok(!profile.get('isNew'), 'Profile is saved');
    assert.deepEqual(
      profile.getProperties(['description', 'camelCaseDescription']),
      { camelCaseDescription, description },
      'correct model attributes present'
    );
  });

  test('with dasherized model name', async function (assert) {
    let customName = 'special name';

    mockCreate('super-hero').match({ name: customName });

    assert.ok(
      FactoryGuy.store.peekAll('super-hero').get('content.length') === 0
    );

    let hero = FactoryGuy.store.createRecord('super-hero', {
      name: customName,
    });
    await hero.save();

    assert.ok(
      FactoryGuy.store.peekAll('super-hero').get('content.length') === 1,
      'No extra records created'
    );
    assert.ok(hero instanceof SuperHero, 'Creates the correct type of record');
    assert.ok(
      hero.get('name') === customName,
      'Passes along the match attributes'
    );
  });

  test('with no specific match', async function (assert) {
    let profile = FactoryGuy.store.createRecord('profile', {
      description: 'whatever',
    });

    mockCreate('profile');

    await profile.save();

    assert.ok(profile.id === '1');
    assert.ok(profile.get('description') === 'whatever');
  });

  test('with no specific match creates many in a loop', async function (assert) {
    mockCreate('profile');

    let profiles = [1, 2, 3].map(function () {
      return FactoryGuy.store.createRecord('profile', {
        description: 'whatever',
      });
    });

    await all(profiles.map((profile) => profile.save()));

    let ids = A(profiles).mapBy('id');
    let descriptions = A(profiles).mapBy('description');

    assert.deepEqual(ids, ['1', '2', '3']);
    assert.deepEqual(descriptions, ['whatever', 'whatever', 'whatever']);
  });

  test('match can take a function - if it returns true it registers a match', async function (assert) {
    assert.expect(2);
    let mock = mockCreate('profile');

    mock.match(function () {
      assert.ok(true, 'matching function is called');
      return true;
    });

    await FactoryGuy.store.createRecord('profile').save();

    assert.equal(mock.timesCalled, 1);
  });

  test('match can take a function - if it returns false it does not register a match', async function (assert) {
    assert.expect(3);
    let mock1 = mockCreate('profile'),
      mock2 = mockCreate('profile');

    mock1.match(function () {
      assert.ok(true, 'matching function is called');
      return false;
    });

    await FactoryGuy.store.createRecord('profile').save();

    assert.equal(mock1.timesCalled, 0);
    assert.equal(mock2.timesCalled, 1);
  });

  test('match can take a function - supplied parameter is the json request body', async function (assert) {
    assert.expect(2);
    let mock = mockCreate('profile');

    mock.match(function (requestBody) {
      assert.ok(true, 'matching function is called');
      const description =
        requestBody.description || // RESTAdapter, JSONSerializer
        (requestBody.profile && requestBody.profile.description) || // RESTSerializer, ActiveModelSerializer
        (requestBody.data && requestBody.data.attributes.description); // JSONAPISerializer
      return description === 'match me!';
    });

    let profile = FactoryGuy.store.createRecord('profile');
    profile.set('description', 'match me!');
    await profile.save();

    assert.equal(mock.timesCalled, 1);
  });

  test('match some attributes', async function (assert) {
    let customDescription = 'special description',
      date = new Date(),
      profile = FactoryGuy.store.createRecord('profile', {
        description: customDescription,
        created_at: date,
      });

    mockCreate('profile').match({ description: customDescription });

    await profile.save();

    assert.ok(profile instanceof Profile);
    assert.ok(profile.id === '1');
    assert.ok(profile.get('description') === customDescription);
  });

  test('match all attributes', async function (assert) {
    let customDescription = 'special description',
      date = new Date(),
      profile = FactoryGuy.store.createRecord('profile', {
        description: customDescription,
        created_at: date,
      });

    mockCreate('profile').match({
      description: customDescription,
      created_at: date,
    });

    await profile.save();

    assert.ok(profile instanceof Profile);
    assert.ok(profile.id === '1');
    assert.ok(profile.get('description') === customDescription);
    assert.ok(profile.get('created_at').toString() === date.toString());
  });

  test('match belongsTo association', async function (assert) {
    let company = make('company'),
      profile = FactoryGuy.store.createRecord('profile', { company: company });

    mockCreate('profile').match({ company: company });

    await profile.save();

    assert.ok(profile.get('company') === company);
  });

  test('match belongsTo polymorphic association', async function (assert) {
    let group = make('big-group'),
      profile = FactoryGuy.store.createRecord('profile', { group: group });

    mockCreate('profile').match({ group: group });

    await profile.save();

    assert.ok(profile.get('group') === group);
  });

  test('using returns attrs with attributes', async function (assert) {
    let date = new Date(),
      profile = FactoryGuy.store.createRecord('profile');

    mockCreate('profile').returns({ attrs: { created_at: date } });

    await profile.save();

    assert.ok(profile.get('created_at').toString() === date.toString());
  });

  test('using returns method with user-supplied model id', async function (assert) {
    let id = 42;

    mockCreate('profile').returns({ attrs: { id: id } });

    let profile = run(() => FactoryGuy.store.createRecord('profile'));
    await profile.save();

    assert.equal(profile.get('id'), id);
    assert.equal(profile.get('foo'), undefined);
  });

  test('match attributes and also return attributes', async function (assert) {
    let date = new Date(2015, 1, 2, 3, 4, 5),
      customDescription = 'special description',
      company = make('company'),
      group = make('big-group');

    mockCreate('profile')
      .match({ description: customDescription, company: company, group: group })
      .returns({ attrs: { created_at: date } });

    let profile = FactoryGuy.store.createRecord('profile', {
      description: customDescription,
      company: company,
      group: group,
    });
    await profile.save();

    assert.ok(profile.get('created_at').toString() === date.toString());
    assert.ok(profile.get('group') === group);
    assert.ok(profile.get('company') === company);
    assert.ok(profile.get('description') === customDescription);
  });

  test('failure with fails method', async function (assert) {
    let mock = mockCreate('profile').fails();

    await FactoryGuy.store
      .createRecord('profile')
      .save()
      .catch(() => {
        assert.ok(true);
        assert.equal(mock.timesCalled, 1);
      });
  });

  test('fails when match args not present in createRecord attributes', async function (assert) {
    let mock = mockCreate('profile').match({
      description: 'correct description',
    });

    await FactoryGuy.store
      .createRecord('profile', { description: 'wrong description' })
      .save()
      .catch(() => {
        assert.ok(true);
        // our mock was NOT called
        assert.equal(mock.timesCalled, 0);
      });
  });

  test('match but still fail with fails method', async function (assert) {
    let description = 'special description';

    let mock = mockCreate('profile')
      .match({ description: description })
      .fails();

    await FactoryGuy.store
      .createRecord('profile', { description: description })
      .save()
      .catch(() => {
        assert.ok(true);
        assert.equal(mock.timesCalled, 1);
      });
  });
};

SharedBehavior.mockCreateFailsWithErrorResponse = function () {
  module('#mockCreate | fails with error response;', function () {
    test('failure with status code 422 and errors in response with fails method', async function (assert) {
      let errors = { errors: { dog: ['bad dog'], dude: ['bad dude'] } };
      let mock = mockCreate('profile').fails({ status: 422, response: errors });

      let profile = FactoryGuy.store.createRecord('profile');
      await profile.save().catch(() => {
        let errorMessages = profile.get('errors.messages');
        assert.deepEqual(errorMessages, ['bad dog', 'bad dude']);
        assert.equal(mock.timesCalled, 1);
        assert.ok(true);
      });
    });
  });
};

SharedBehavior.mockCreateReturnsAssociations = function () {
  module('#mockCreate | returns association', function () {
    test('belongsTo', async function (assert) {
      let company = build('company'),
        profile = FactoryGuy.store.createRecord('profile');

      mockCreate('profile').returns({ attrs: { company } });

      await profile.save();

      assert.equal(profile.get('company.id'), company.get('id').toString());
      assert.equal(profile.get('company.name'), company.get('name'));
    });

    test('belongsTo ( polymorphic )', async function (assert) {
      let person = build('super-hero'),
        outfit = FactoryGuy.store.createRecord('outfit');

      mockCreate('outfit').returns({ attrs: { person } });

      await outfit.save();

      assert.equal(outfit.get('person.id'), person.get('id').toString());
      assert.equal(outfit.get('person.name'), person.get('name'));
    });

    test('hasMany', async function (assert) {
      let outfits = buildList('outfit', 2),
        hero = FactoryGuy.store.createRecord('super-hero');

      mockCreate('super-hero').returns({ attrs: { outfits } });

      await hero.save();

      assert.deepEqual(hero.get('outfits').mapBy('id'), ['1', '2']);
      assert.deepEqual(hero.get('outfits').mapBy('name'), [
        'Outfit-1',
        'Outfit-2',
      ]);
    });
  });
};

SharedBehavior.mockCreateReturnsEmbeddedAssociations = function () {
  module('#mockCreate | returns embedded association', function () {
    test('belongsTo', async function (assert) {
      let company = build('company'),
        comitBook = FactoryGuy.store.createRecord('comic-book');

      mockCreate('comic-book').returns({ attrs: { company } });

      await comitBook.save();

      assert.equal(comitBook.get('company.id'), company.get('id').toString());
      assert.equal(
        comitBook.get('company.name'),
        company.get('name').toString()
      );
    });
  });
};

/////// mockUpdate //////////

SharedBehavior.mockUpdateTests = function () {
  test('with modelType and id', async function (assert) {
    let profile = make('profile');
    mockUpdate('profile', profile.id);

    profile.set('description', 'new desc');
    await profile.save();

    assert.ok(profile.get('description') === 'new desc');
  });

  test('with modelType and id using returns to return an attribute', async function (assert) {
    let profile = make('profile'),
      date = new Date(2016, 1, 4);

    mockUpdate('profile', profile.id).returns({ attrs: { created_at: date } });

    profile.set('description', 'new desc');
    await profile.save();

    assert.ok(profile.get('description') === 'new desc');
    assert.ok(profile.get('created_at').toString() === date.toString());
  });

  test('with only modelType', async function (assert) {
    let profile = make('profile');
    mockUpdate('profile');

    profile.set('description', 'new desc');
    await profile.save();

    assert.equal(profile.get('description'), 'new desc');
  });

  test('with model', async function (assert) {
    let profile = make('profile');
    mockUpdate(profile);

    profile.set('description', 'new desc');
    await profile.save();

    assert.equal(profile.get('description'), 'new desc');
  });

  test('with model and query param', async function (assert) {
    let employee = make('employee');
    mockUpdate(employee);

    employee.set('gender', 'new gender');
    await employee.save();

    assert.equal(employee.get('gender'), 'new gender');
  });

  test('with model using returns to return an attribute', async function (assert) {
    let profile = make('profile'),
      date = new Date(2016, 1, 4);
    mockUpdate(profile).returns({ attrs: { created_at: date } });

    profile.set('description', 'new desc');
    await profile.save();

    assert.ok(profile.get('description') === 'new desc');
    assert.ok(profile.get('created_at').toString() === date.toString());
  });

  test('with model that has polymorphic belongsTo', async function (assert) {
    let group = make('group'),
      profile = make('profile', { group: group });
    mockUpdate(profile);

    profile.set('description', 'new desc');
    await profile.save();

    assert.ok(profile.get('description') === 'new desc');
  });

  test('with model that has model fragment as the updated field', async function (assert) {
    let employee = make('employee');

    mockUpdate(employee);

    assert.ok(!employee.get('hasDirtyAttributes'));
    run(() => employee.set('name.firstName', 'Jamie'));

    assert.ok(employee.get('name.firstName') === 'Jamie');
    assert.ok(employee.get('name.lastName') === 'Lannister');

    assert.ok(employee.get('hasDirtyAttributes'));

    await employee.save();
    assert.ok(!employee.get('hasDirtyAttributes'));
  });

  test('with modelType and id that fails', async function (assert) {
    let profile = make('profile');

    mockUpdate('profile', profile.id).fails({ status: 500 });

    profile.set('description', 'new desc');
    await profile.save().catch(function (reason) {
      let error = reason.errors[0];
      assert.equal(error.status, '500');
    });
  });

  test('with model that fails with custom status', async function (assert) {
    let profile = make('profile');

    mockUpdate(profile).fails({ status: 401 });

    profile.set('description', 'new desc');
    await profile.save().catch(function (reason) {
      let error = reason.errors[0];
      assert.equal(error.status, '401');
    });
  });

  test('with model that fails and then succeeds', async function (assert) {
    let profile = make('profile');

    let updateMock = mockUpdate(profile).fails();

    profile.set('description', 'new desc');
    await profile
      .save()
      .catch(() => assert.ok(true, 'update failed the first time'));
    updateMock.succeeds();
    assert.ok(!profile.get('valid'), 'Profile is invalid.');

    await profile.save();
    assert.ok(!profile.get('saving'), 'Saved model');
    assert.ok(
      profile.get('description') === 'new desc',
      'Description was updated.'
    );
  });

  test('match can take a function - it can accept FormData as requestBody', async function (assert) {
    assert.expect(2);
    let customDescription = 'special description',
      profile = make('profile'),
      updateMock = mockUpdate(profile),
      adapter = FactoryGuy.store.adapterFor('profile');

    adapter.updateRecord = (store, type, snapshot) => {
      let url = adapter.urlForUpdateRecord(
        snapshot.id,
        type.modelName,
        snapshot
      );
      let httpMethod = FactoryGuy.updateHTTPMethod(type.modelName);

      let fd = new FormData();
      fd.append('description', snapshot.attr('description'));
      adapter.ajax(url, httpMethod, {
        data: fd,
        processData: false,
        contentType: false,
      });
    };

    updateMock.match(function (requestBody) {
      assert.ok(
        requestBody instanceof FormData,
        'matching function is called when request body is FormData'
      );
      return true;
    });

    profile.set('description', customDescription);
    await profile.save();

    assert.equal(updateMock.timesCalled, 1);
  });

  test('match can take a function - if it returns true it registers a match', async function (assert) {
    assert.expect(2);
    let customDescription = 'special description',
      profile = make('profile'),
      updateMock = mockUpdate(profile);

    updateMock.match(function (/*requestData*/) {
      assert.ok(true, 'matching function is called');
      return true;
    });

    profile.set('description', customDescription);
    await profile.save();

    assert.equal(updateMock.timesCalled, 1);
  });

  test('match can take a function - if it returns false it does not register a match', async function (assert) {
    assert.expect(3);
    let customDescription = 'special description',
      profile = make('profile'),
      updateMock1 = mockUpdate(profile),
      updateMock2 = mockUpdate(profile);

    updateMock1.match(function () {
      assert.ok(true, 'updateMock1 matching function is called');
      return false;
    });

    profile.set('description', customDescription);
    await profile.save();

    assert.equal(updateMock1.timesCalled, 0);
    assert.equal(updateMock2.timesCalled, 1);
  });

  test('match some attributes', async function (assert) {
    let customDescription = 'special description',
      profile = make('profile');

    mockUpdate('profile', profile.id).match({ description: customDescription });

    profile.set('description', customDescription);
    await profile.save();

    assert.ok(profile instanceof Profile);
    assert.ok(profile.id === '1');
    assert.ok(profile.get('description') === customDescription);
  });

  test('match some attributes with only modelType', async function (assert) {
    let customDescription = 'special description',
      profile = make('profile', { description: customDescription }),
      profile2 = make('profile', { description: customDescription });

    mockUpdate('profile').match({ description: customDescription });

    await profile.save();

    assert.ok(profile instanceof Profile);
    assert.ok(profile.id === '1');
    assert.ok(profile.get('description') === customDescription);

    await profile2.save();

    assert.ok(profile2 instanceof Profile);
    assert.ok(profile2.id === '2');
    assert.ok(profile2.get('description') === customDescription);
  });

  test('match all attributes', async function (assert) {
    let date = new Date(),
      profile = make('profile', { created_at: date, aBooleanField: false }),
      customDescription = 'special description';

    mockUpdate('profile', profile.id).match({
      description: customDescription,
      created_at: date,
      aBooleanField: true,
    });

    profile.setProperties({
      description: customDescription,
      aBooleanField: true,
    });

    await profile.save();

    assert.ok(profile instanceof Profile);
    assert.ok(profile.id === '1');
    assert.ok(profile.get('description') === customDescription);
    assert.ok(profile.get('created_at').toString() === date.toString());
    assert.ok(profile.get('aBooleanField') === true);
  });

  test('match belongsTo association', async function (assert) {
    let company = make('company'),
      profile = make('profile', { company: company });

    mockUpdate('profile', profile.id).match({ company: company });

    await profile.save();

    assert.ok(profile.get('company') === company);
  });

  test('match belongsTo polymorphic association', async function (assert) {
    let group = make('big-group');
    let profile = make('profile', { group: group });
    mockUpdate('profile', profile.id).match({ group: group });

    await profile.save();
    assert.ok(profile.get('group') === group);
  });

  test('match attributes and also return attributes', async function (assert) {
    let date = new Date(2015, 1, 2, 3, 4, 5),
      customDescription = 'special description',
      company = make('company'),
      group = make('big-group');

    let profile = make('profile', {
      description: customDescription,
      company: company,
      group: group,
    });

    mockUpdate('profile', profile.id)
      .match({ description: customDescription, company: company, group: group })
      .returns({ attrs: { created_at: date } });

    await profile.save();

    assert.ok(profile.get('created_at').toString() === date.toString());
    assert.ok(profile.get('group') === group);
    assert.ok(profile.get('company') === company);
    assert.ok(profile.get('description') === customDescription);
  });

  test('fails when match args not present', async function (assert) {
    let profile = make('profile');

    let mock = mockUpdate('profile', profile.id).match({
      description: 'correct description',
    });

    profile.set('description', 'wrong description');
    profile.save().catch(() => {
      assert.ok(true);
      assert.equal(mock.timesCalled, 0);
    });
  });

  test('succeeds then fails when match args not present with only modelType', async function (assert) {
    let customDescription = 'special description';
    let profile = make('profile', { description: customDescription });
    let profile2 = make('profile');

    let mock = mockUpdate('profile').match({ description: customDescription });

    await profile.save();
    assert.ok(true);
    assert.equal(mock.timesCalled, 1);

    await profile2.save().catch(() => {
      assert.ok(true);
      assert.equal(mock.timesCalled, 1);
    });
  });

  test('match but still fail with fails method', async function (assert) {
    let description = 'special description';
    let profile = make('profile', { description: description });

    let mock = mockUpdate('profile', profile.id)
      .match({ description: description })
      .fails();

    await profile.save().catch(() => {
      assert.ok(true);
      assert.equal(mock.timesCalled, 1);
    });
  });

  test('removes attributes based serializer attrs settings', async function (assert) {
    let serializer = FactoryGuy.store.serializerFor('profile');
    serializer.attrs = {
      created_at: {
        serialize: false,
      },
    };

    let date = new Date();
    let profile = make('profile');
    profile.set('created_at', date);

    mockUpdate(profile)
      .match({ created_at: null }) // serializer removes date
      .returns({ attrs: { created_at: date } });

    await profile.save();

    assert.ok(profile.get('created_at').toString() === date.toString());
  });
};

SharedBehavior.mockUpdateWithErrorMessages = function () {
  module('#mockUpdate | error messages', function () {
    test('with model returns custom response', async function (assert) {
      let profile = make('profile');

      mockUpdate(profile).fails({
        status: 400,
        /* ember-data 3.28 -> 4.x rest adapter normalizeErrorResponse only passes on string response value as 'detail'
         * ember-data 5.0 fixes this, but we cannot use it yet https://github.com/emberjs/data/pull/8621
         * Just use a primitive value in the meantime.
         */
        // response: { errors: { description: ['invalid data'] } },
        response: 'invalid data',
        convertErrors: false,
      });

      profile.set('description', 'new desc');
      await profile.save().catch(function (reason) {
        let errors = reason.errors;
        assert.equal(
          errors[0].detail,
          // errors.description,
          'invalid data',
          'custom description shows up in errors'
        );
      });
    });
  });
};

SharedBehavior.mockUpdateReturnsAssociations = function () {
  module('#mockUpdate | returns association', function () {
    test('belongsTo', async function (assert) {
      let profile = make('profile');
      profile.set('description', 'new desc');

      let company = build('company');
      mockUpdate(profile).returns({ attrs: { company } });

      await profile.save();

      assert.equal(profile.get('company.id'), company.get('id').toString());
      assert.equal(profile.get('company.name'), company.get('name'));
    });

    test('belongsTo ( polymorphic )', async function (assert) {
      let newValue = 'new name',
        outfit = make('outfit');
      outfit.set('name', newValue);

      let person = build('super-hero');
      mockUpdate(outfit).returns({ attrs: { person } });

      await outfit.save();

      assert.equal(outfit.get('name'), newValue);
      assert.equal(outfit.get('person.id'), person.get('id').toString());
      assert.equal(outfit.get('person.name'), person.get('name'));
    });

    test('hasMany', async function (assert) {
      let newValue = 'BoringMan',
        hero = make('bat_man');
      hero.set('name', newValue);

      let outfits = buildList('outfit', 2);
      mockUpdate(hero).returns({ attrs: { outfits } });

      await hero.save();

      assert.equal(hero.get('name'), newValue);
      assert.deepEqual(hero.get('outfits').mapBy('id'), ['1', '2']);
      assert.deepEqual(hero.get('outfits').mapBy('name'), [
        'Outfit-1',
        'Outfit-2',
      ]);
    });
  });
};

SharedBehavior.mockUpdateReturnsEmbeddedAssociations = function () {
  module('#mockUpdate | returns embedded association', function () {
    test('belongsTo', async function (assert) {
      let newValue = 'new name',
        comicBook = make('comic-book', { characters: [] });
      comicBook.set('name', newValue);

      let company = build('company');
      mockUpdate(comicBook).returns({ attrs: { company } });

      await comicBook.save();

      assert.equal(comicBook.get('name'), newValue);
      assert.equal(comicBook.get('company.id'), company.get('id').toString());
      assert.equal(
        comicBook.get('company.name'),
        company.get('name').toString()
      );
    });
  });
};

/////// mockDelete //////////

SharedBehavior.mockDeleteTests = function () {
  test('with modelType', async function (assert) {
    let profiles = makeList('profile', 2);
    let profile = profiles[0];
    mockDelete('profile');

    assert.equal(FactoryGuy.store.peekAll('profile').get('content.length'), 2);

    await profile.destroyRecord();
    assert.equal(FactoryGuy.store.peekAll('profile').get('content.length'), 1);
  });

  test('with modelType and id', async function (assert) {
    let profile = make('profile');
    mockDelete('profile', profile.id);

    await profile.destroyRecord();
    assert.equal(FactoryGuy.store.peekAll('profile').get('content.length'), 0);
  });

  test('with model', async function (assert) {
    let profile = make('profile');
    mockDelete(profile);

    await profile.destroyRecord();
    assert.equal(FactoryGuy.store.peekAll('profile').get('content.length'), 0);
  });

  test('with model and query param', async function (assert) {
    let employee = make('employee');
    mockDelete(employee);

    await employee.destroyRecord();
    assert.equal(FactoryGuy.store.peekAll('employee').get('content.length'), 0);
  });

  test('with modelType that fails', async function (assert) {
    let profiles = makeList('profile', 2);
    let profile = profiles[0];
    let mock = mockDelete('profile').fails({ status: 500 });

    await profile.destroyRecord().catch(function (reason) {
      let error = reason.errors[0];
      assert.equal(error.status, '500');
      assert.equal(mock.timesCalled, 1);
      assert.ok(true);
    });
  });

  test('with modelType and id that fails', async function (assert) {
    let profile = make('profile');
    let mock = mockDelete('profile', profile.id).fails({ status: 500 });

    await profile.destroyRecord().catch(function (reason) {
      let error = reason.errors[0];
      assert.equal(error.status, '500');
      assert.equal(mock.timesCalled, 1);
      assert.ok(true);
    });
  });

  test('with model that fails with custom status', async function (assert) {
    let profile = make('profile');

    mockDelete(profile).fails({ status: 401 });

    await profile.destroyRecord().catch(function (reason) {
      let error = reason.errors[0];
      assert.equal(error.status, '401');
    });
  });

  test('with modelType that fails and then succeeds', async function (assert) {
    let profiles = makeList('profile', 2);
    let profile = profiles[0];
    let deleteMock = mockDelete('profile').fails();

    await profile
      .destroyRecord()
      .catch(() => assert.ok(true, 'delete failed the first time'));
    deleteMock.succeeds();

    await profile.destroyRecord();
    assert.equal(FactoryGuy.store.peekAll('profile').get('content.length'), 1);
  });

  test('with modelType and id that fails and then succeeds', async function (assert) {
    let profile = make('profile');

    let deleteMock = mockDelete('profile', profile.id).fails();

    await profile
      .destroyRecord()
      .catch(() => assert.ok(true, 'delete failed the first time'));
    deleteMock.succeeds();

    await profile.destroyRecord();
    assert.equal(FactoryGuy.store.peekAll('profile').get('content.length'), 0);
  });

  test('with model that fails and then succeeds', async function (assert) {
    let profile = make('profile');

    let deleteMock = mockDelete(profile).fails();

    await profile
      .destroyRecord()
      .catch(() => assert.ok(true, 'delete failed the first time'));
    deleteMock.succeeds();

    await profile.destroyRecord();
    assert.equal(FactoryGuy.store.peekAll('profile').get('content.length'), 0);
  });
};

export default SharedBehavior;
