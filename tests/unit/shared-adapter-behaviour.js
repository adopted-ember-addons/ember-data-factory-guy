import Ember from 'ember';
import { run } from '@ember/runloop';
import { moduleFor, test } from 'ember-qunit';
import { isEquivalent } from 'ember-data-factory-guy/utils/helper-functions';

import FactoryGuy, {
  make, makeList, build, buildList,
  mockFindRecord, mockFindAll, mockReload, mockQuery,
  mockQueryRecord, mockCreate, mockUpdate, mockDelete
} from 'ember-data-factory-guy';

import $ from 'jquery';
import { inlineSetup } from '../helpers/utility-methods';

import Profile from 'dummy/models/profile';
import SuperHero from 'dummy/models/super-hero';

const A = Ember.A;
let SharedBehavior = {};

//////// mockFindRecord common /////////
SharedBehavior.mockFindRecordCommonTests = function() {

  test("the basic returns default attributes", function(assert) {
    run(() => {
      let done      = assert.async(),
          mock      = mockFindRecord('profile'),
          profileId = mock.get('id');

      FactoryGuy.store.findRecord('profile', profileId).then(function(profile) {
        assert.equal(profile.get('id'), profileId);
        assert.equal(profile.get('description'), 'Text goes here');
        done();
      });
    });
  });

  test("when returns json is used", async function(assert) {
    return run(async () => {
      let json      = build('profile'),
          mock      = mockFindRecord('profile').returns({json}),
          profileId = mock.get('id');

      let profile = await FactoryGuy.store.findRecord('profile', profileId);
      assert.equal(profile.get('id'), profileId);
      assert.equal(profile.get('description'), json.get('description'));
    });
  });

  test("returns id succeeds and returns model when id for model type found in store after createRecord", function(assert) {
    run(() => {
      let done = assert.async();
      let profileId = 1,
          {store}   = FactoryGuy;

      mockCreate('profile').returns({attrs: {id: profileId}});
      mockFindRecord('profile').returns({id: profileId});

      let newRecord = store.createRecord('profile', {description: 'foo'});
      newRecord.save().then(newRecord => {
        store.findRecord('profile', profileId).then(foundRecord => {
          assert.deepEqual(foundRecord, newRecord);
          done();
        });
      });
    });
  });

  test("returns id succeeds and returns model when id for model type found in store", function(assert) {
    let done = assert.async();

    let existingProfile = make('profile');
    mockFindRecord('profile').returns({id: existingProfile.get('id')});
    let promise = run(() => FactoryGuy.store.findRecord('profile', existingProfile.get('id')));
    promise.then((profile) => {
      assert.equal(profile.get('id'), existingProfile.get('id'));
      done();
    });
  });

  test("returns id fails with 404 if record for id and model type not found in store", function(assert) {
    run(() => {
      let done = assert.async();
      let profileId = 1;
      mockFindRecord('profile').returns({id: profileId});

      FactoryGuy.store.findRecord('profile', profileId)
        .catch((reason) => {
          assert.equal(reason.errors[0].status, '404');
          done();
        });
    });
  });

  //  test("returns model succeeds", function(assert) {
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
  //
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

  test("returns model that has attribute named type, but is not polymorphic", async function(assert) {
    return run(async () => {
      let cat = make('cat', {type: 'Cutest'});
      let mock = mockFindRecord('cat').returns({model: cat});

      let catA = await FactoryGuy.store.findRecord('cat', mock.get('id'), {reload: true});
      assert.equal(catA.get('type'), 'Cutest');
    });
  });

  test("when using model as the param of modelName to find record", async function(assert) {
    return run(async () => {
      let cat  = make('cat'),
          mock = mockFindRecord(cat);

      let catA = await FactoryGuy.store.findRecord('cat', mock.get('id'), {reload: true});
      assert.deepEqual(catA, cat);
    });
  });

  // test for issue # 219
  test("with model that has attribute key defined in serializer attrs", function(assert) {
    run(() => {
      let done = assert.async();
      let mock = mockFindRecord('cat');

      assert.equal(mock.get('catName'), 'Cat 1');
      assert.equal(mock.get('catFriend'), 'Friend 1');

      FactoryGuy.store.findRecord('cat', mock.get('id')).then(function(cat) {
        assert.equal(cat.get('name'), 'Cat 1');
        assert.equal(cat.get('friend'), 'Friend 1');
        done();
      });
    });
  });

  test("with model that has primaryKey defined in serializer attrs and is attribute of model", function(assert) {
    run(() => {
      let done = assert.async();
      let mock = mockFindRecord('dog');

      FactoryGuy.store.findRecord('dog', mock.get('id')).then(function(dog) {
        assert.equal(dog.get('id'), 'Dog1');
        assert.equal(dog.get('dogNumber'), 'Dog1');
        done();
      });
    });
  });

  test("with fixture options", function(assert) {
    run(() => {
      let done = assert.async();
      let mock = mockFindRecord('profile', {description: 'dude'});
      let profileId = mock.get('id');

      FactoryGuy.store.findRecord('profile', profileId).then(function(profile) {
        assert.ok(profile.get('description') === 'dude');
        done();
      });
    });
  });

  test("handles differently cased attributes", function(assert) {
    run(() => {
      let done = assert.async();

      let mock = mockFindRecord('profile');
      let profileId = mock.get('id');

      FactoryGuy.store.findRecord('profile', profileId).then(function(profile) {
        assert.ok(profile.get('camelCaseDescription') === 'textGoesHere');
        assert.ok(profile.get('snake_case_description') === 'text_goes_here');
        done();
      });
    });
  });

  test("with traits", function(assert) {
    run(() => {
      let done = assert.async();

      let mock = mockFindRecord('profile', 'goofy_description');
      let profileId = mock.get('id');

      FactoryGuy.store.findRecord('profile', profileId).then(function(profile) {
        assert.ok(profile.get('description') === 'goofy');
        done();
      });
    });
  });

  test("with traits and extra options", function(assert) {
    run(() => {
      let done = assert.async();

      let mock = mockFindRecord('profile', 'goofy_description', {description: 'dude'});
      let profileId = mock.get('id');

      FactoryGuy.store.findRecord('profile', profileId).then(function(profile) {
        assert.ok(profile.get('description') === 'dude');
        done();
      });
    });
  });

  test("failure with fails method when passing modelName as parameter", function(assert) {
    let done = assert.async();
    run(() => {
      let mock = mockFindRecord('profile').fails();
      FactoryGuy.store.findRecord('profile', mock.get('id')).catch(() => {
        assert.equal(mock.timesCalled, 1);
        done();
      });
    });
  });

  test("failure with fails method when passing modeName as parameter and returning instance", function(assert) {
    run(() => {
      let model = make('profile');
      let mock = mockFindRecord('profile').returns({model}).fails();

      return FactoryGuy.store.findRecord('profile', model.id, {reload: true})
        .catch(() => {
          assert.equal(mock.timesCalled, 1);
          assert.equal(mock.status, 500);
        });
    });
  });

  test("failure with fails method when passing model instance as parameter and no returns is used", function(assert) {
    let done = assert.async();

    let profile = make('profile');
    let mock = mockFindRecord(profile).fails();
    run(() => {
      FactoryGuy.store.findRecord('profile', profile.id, {reload: true})
        .catch(() => {
          assert.equal(mock.timesCalled, 1, 'mock called once');
          assert.equal(mock.status, 500, 'stats 500');
          done();
        });
    });
  });

};

SharedBehavior.mockFindRecordSideloadingTests = function(serializer, serializerType) {

  moduleFor('serializer:application', `${serializer} #mockFindRecord | sideloading`, inlineSetup(serializerType));

  test("belongsTo association", function(assert) {
    run(() => {
      let done = assert.async();
      let profile = mockFindRecord('profile', 'with_company', 'with_bat_man');
      let profileId = profile.get('id');

      FactoryGuy.store.findRecord('profile', profileId).then(function(profile) {
        assert.ok(profile.get('company.name') === 'Silly corp');
        assert.ok(profile.get('superHero.name') === 'BatMan');
        done();
      });
    });
  });


  test("hasMany association", function(assert) {
    run(() => {
      let done = assert.async();
      let user = mockFindRecord('user', 'with_hats');
      let userId = user.get('id');

      FactoryGuy.store.findRecord('user', userId).then(function(user) {
        assert.ok(user.get('hats.length') === 2);
        assert.ok(user.get('hats.firstObject.type') === 'BigHat');
        done();
      });
    });
  });

  test("using returns with json", function(assert) {
    run(() => {
      let done = assert.async();

      let json = build('profile', 'with_company', 'with_bat_man');

      mockFindRecord('profile').returns({json});
      let profileId = json.get('id');

      FactoryGuy.store.findRecord('profile', profileId).then(function(profile) {
        assert.ok(profile.get('company.name') === 'Silly corp');
        assert.ok(profile.get('superHero.name') === 'BatMan');
        done();
      });
    });
  });

  test("using returns with json with composed hasMany association", function(assert) {
    run(() => {
      let done = assert.async();

      let hat1 = build('big-hat');
      let hat2 = build('big-hat');
      let json = build('user', {hats: [hat1, hat2]});

      mockFindRecord('user').returns({json});

      FactoryGuy.store.findRecord('user', json.get('id')).then(function(user) {
        assert.ok(user.get('hats.firstObject.id') === hat1.get('id') + '');
        assert.ok(user.get('hats.lastObject.id') === hat2.get('id') + '');
        done();
      });
    });
  });

  test("using returns with model", function(assert) {
    run(() => {
      let done = assert.async();

      let model = make('profile', 'with_company', 'with_bat_man');
      let profile = mockFindRecord('profile').returns({model});
      let profileId = profile.get('id');

      FactoryGuy.store.findRecord('profile', profileId, {reload: true}).then(function(profile) {
        assert.ok(profile.get('company.name') === 'Silly corp');
        assert.ok(profile.get('superHero.name') === 'BatMan');
        assert.equal(FactoryGuy.store.peekAll('profile').get('content').length, 1, "does not make another profile");
        done();
      });
    });
  });
};

SharedBehavior.mockFindRecordEmbeddedTests = function(serializer, serializerType) {

  moduleFor('serializer:application', `${serializer} #mockFindRecord | embedded`, inlineSetup(serializerType));

  test("belongsTo", function(assert) {
    run(() => {
      let done = assert.async();
      let mock = mockFindRecord('comic-book', 'marvel');

      FactoryGuy.store.findRecord('comic-book', mock.get('id')).then(function(comic) {
        assert.ok(comic.get('name') === 'Comic Times #1');
        assert.ok(comic.get('company.name') === 'Marvel Comics');
        done();
      });
    });
  });

  test("hasMany", function(assert) {
    run(() => {
      let done = assert.async();
      let mock = mockFindRecord('comic-book', 'with_bad_guys');

      FactoryGuy.store.findRecord('comic-book', mock.get('id')).then(function(comic) {
        assert.ok(comic.get('name') === 'Comic Times #1');
        assert.ok(comic.get('characters').mapBy('name') + '' === ['BadGuy#1', 'BadGuy#2'] + '');
        done();
      });
    });
  });
};

//////// mockReload /////////

SharedBehavior.mockReloadTests = function() {

  test("with a record handles reload, and does not change attributes", function(assert) {
    let done = assert.async();
    run(() => {
      let profile = make('profile', {description: "whatever"});
      mockReload(profile);

      profile.reload().then(function(reloaded) {
        assert.ok(reloaded.id === profile.id);
        assert.ok(reloaded.get('description') === profile.get('description'));
        done();
      });
    });
  });

  test("can change the attributes using returns method with attrs", function(assert) {
    let done = assert.async();
    run(() => {
      let profile = make('profile', {description: "whatever", camelCaseDescription: "noodles"});

      mockReload(profile).returns({attrs: {description: "moo"}});

      profile.reload().then(function(reloaded) {
        assert.ok(reloaded.id === profile.id, 'does not change id');
        assert.ok(reloaded.get('description') === "moo", "attribute changed");
        assert.ok(reloaded.get('camelCaseDescription') === "noodles", "other attributes are same");
        done();
      });
    });
  });

  test("using returns method with json", function(assert) {
    let done = assert.async();
    run(() => {
      let profile = make('profile', {description: "tomatoes", camelCaseDescription: "noodles"});

      let newProfile = build('profile', {id: profile.get('id'), description: "potatoes", camelCaseDescription: "poodles"});
      mockReload(profile).returns({json: newProfile});

      profile.reload().then(function(reloaded) {
        assert.ok(reloaded.id === profile.id, 'does not change id');
        assert.ok(reloaded.get('description') === "potatoes", "description changed");
        assert.ok(reloaded.get('camelCaseDescription') === "poodles", "camelCaseDescription changes");
        done();
      });
    });
  });

  test("failure with fails method", function(assert) {
    run(() => {
      let done = assert.async();
      let mock = mockReload('profile', 1).fails();

      FactoryGuy.store.findRecord('profile', 1)
        .catch(() => {
            assert.equal(mock.timesCalled, 1);
            assert.ok(true);
            done();
          }
        );
    });
  });

};

/////// mockFindAll common //////////
SharedBehavior.mockFindAllCommonTests = function() {

  test("the basic", function(assert) {
    run(() => {
      let done = assert.async();
      mockFindAll('user', 2);

      FactoryGuy.store.findAll('user').then(function(users) {
        assert.ok(users.get('length') === 2);
        done();
      });
    });
  });

  test("handles differently cased attributes", function(assert) {
    run(() => {
      let done = assert.async();

      mockFindAll('profile', 1);

      FactoryGuy.store.findAll('profile').then(function(profiles) {
        assert.ok(profiles.get('firstObject.camelCaseDescription') === 'textGoesHere');
        assert.ok(profiles.get('firstObject.snake_case_description') === 'text_goes_here');
        done();
      });
    });
  });

  test("asking for no return records", function(assert) {
    run(() => {
      let done = assert.async();
      mockFindAll('user', 0);

      FactoryGuy.store.findAll('user').then(function(profiles) {
        assert.ok(profiles.get('length') === 0);
        done();
      });
    });
  });

  test("with fixture options", function(assert) {
    run(() => {
      let done = assert.async();
      mockFindAll('profile', 2, {description: 'dude'});

      FactoryGuy.store.findAll('profile').then(function(profiles) {
        assert.ok(profiles.get('length') === 2);
        assert.ok(profiles.get('firstObject.description') === 'dude');
        done();
      });
    });
  });

  test("with traits", function(assert) {
    let done = assert.async();
    mockFindAll('profile', 2, 'goofy_description');

    FactoryGuy.store.findAll('profile').then(function(profiles) {
      assert.ok(profiles.get('length') === 2);
      assert.ok(profiles.get('firstObject.description') === 'goofy');
      done();
    });
  });

  test("with traits and extra options", function(assert) {
    let done = assert.async();
    mockFindAll('profile', 2, 'goofy_description', {description: 'dude'});

    FactoryGuy.store.findAll('profile').then(function(profiles) {
      assert.ok(profiles.get('length') === 2);
      assert.ok(profiles.get('firstObject.description') === 'dude');
      done();
    });
  });
};

//////// mockFindAll with sideloading /////////
SharedBehavior.mockFindAllSideloadingTests = function(serializer, serializerType) {

  moduleFor('serializer:application', `${serializer} #mockFindAll | sideloading`, inlineSetup(serializerType));

  test("with belongsTo association", function(assert) {
    run(() => {
      let done = assert.async();
      mockFindAll('profile', 2, 'with_company', 'with_bat_man');

      FactoryGuy.store.findAll('profile').then(function(profiles) {
        assert.ok(profiles.get('length') === 2);
        assert.ok(profiles.get('firstObject.company.name') === 'Silly corp');
        assert.ok(profiles.get('lastObject.superHero.name') === 'BatMan');
        done();
      });
    });
  });


  test("with hasMany association", function(assert) {
    run(() => {
      let done = assert.async();

      mockFindAll('user', 2, 'with_hats');

      FactoryGuy.store.findAll('user').then(function(users) {
        assert.ok(users.get('length') === 2);
        assert.ok(A(users.get('lastObject.hats')).mapBy('type') + '' === ['BigHat', 'BigHat'] + '');
        assert.ok(A(users.get('lastObject.hats')).mapBy('id') + '' === [3, 4] + '');
        done();
      });
    });
  });

  test("with diverse models", function(assert) {
    run(() => {
      let done = assert.async();
      mockFindAll('profile', 'goofy_description', {description: 'foo'}, ['goofy_description', {aBooleanField: true}]);

      FactoryGuy.store.findAll('profile').then(function(profiles) {
        assert.ok(profiles.get('length') === 3);
        assert.ok(A(profiles).objectAt(0).get('description') === 'goofy');
        assert.ok(A(profiles).objectAt(0).get('aBooleanField') === false);
        assert.ok(A(profiles).objectAt(1).get('description') === 'foo');
        assert.ok(A(profiles).objectAt(1).get('aBooleanField') === false);
        assert.ok(A(profiles).objectAt(2).get('description') === 'goofy');
        assert.ok(A(profiles).objectAt(2).get('aBooleanField') === true);
        done();
      });
    });
  });

  test("using returns with json", function(assert) {
    run(() => {
      let done = assert.async();

      let json = buildList('profile', 'with_company', 'with_bat_man');
      mockFindAll('profile').returns({json});

      FactoryGuy.store.findAll('profile').then(function(profiles) {
        assert.ok(profiles.get('firstObject.company.name') === 'Silly corp');
        assert.ok(profiles.get('lastObject.superHero.name') === 'BatMan');
        done();
      });
    });
  });

  test("using returns with model", function(assert) {
    let done = assert.async();

    let models = makeList('profile', 'with_company', 'with_bat_man');
    mockFindAll('profile').returns({models});

    FactoryGuy.store.findAll('profile').then(function(profiles) {
      assert.ok(profiles.get('firstObject.company.name') === 'Silly corp');
      assert.ok(profiles.get('lastObject.superHero.name') === 'BatMan');
      assert.equal(FactoryGuy.store.peekAll('profile').get('content').length, 2, "does not make new profiles");
      done();
    });
  });

  //  test("handles include params", function(assert) {
  //    run(()=> {
  //      let done = assert.async();
  //
  //      let json = buildList('profile', 'with_company');
  //      mockFindAll('profile').withParams({include: 'company'}).returns({ json });
  //
  //      FactoryGuy.store.findAll('profile', {include: 'company'}).then(function(profiles) {
  //        assert.ok(profiles.get('firstObject.company.name') === 'Silly corp');
  //        done();
  //      });
  //    });
  //  });

};

SharedBehavior.mockFindAllEmbeddedTests = function(serializer, serializerType) {

  moduleFor('serializer:application', `${serializer} #mockFindAll | embedded`, inlineSetup(serializerType));

  test("belongsTo", function(assert) {
    run(() => {
      let done = assert.async();

      mockFindAll('comic-book', 2, 'marvel');

      FactoryGuy.store.findAll('comic-book').then(function(comics) {
        assert.ok(comics.mapBy('name') + '' === ['Comic Times #1', 'Comic Times #2'] + '');
        assert.ok(comics.mapBy('company.name') + '' === ['Marvel Comics', 'Marvel Comics'] + '');
        done();
      });
    });
  });

  test("hasMany", function(assert) {
    run(() => {
      let done = assert.async();

      mockFindAll('comic-book', 2, 'with_bad_guys');

      FactoryGuy.store.findAll('comic-book').then(function(comics) {
        assert.ok(comics.mapBy('name') + '' === ['Comic Times #1', 'Comic Times #2'] + '');
        assert.ok(comics.get('firstObject.characters').mapBy('name') + '' === ['BadGuy#1', 'BadGuy#2'] + '');
        assert.ok(comics.get('lastObject.characters').mapBy('name') + '' === ['BadGuy#3', 'BadGuy#4'] + '');
        done();
      });
    });
  });
};

/////// mockQuery //////////

SharedBehavior.mockQueryTests = function() {

  test("not using returns", function(assert) {
    run(() => {
      let done = assert.async();

      mockQuery('user', {name: 'Bob'});

      FactoryGuy.store.query('user', {name: 'Bob'}).then(function(users) {
        assert.equal(users.get('length'), 0, "nothing returned");
        done();
      });
    });
  });

  test("with no parameters matches query with any parameters", function(assert) {
    var done = assert.async();
    mockQuery('user');
    FactoryGuy.store.query('user', {name: 'Bob'})
      .then(() => {
        assert.ok(true);
        done();
      });
  });

  test("using fails makes the request fail", function(assert) {
    run(() => {
      let done = assert.async();

      let errors = {errors: {name: ['wrong']}};

      let mock = mockQuery('user').fails({status: 422, response: errors});
      FactoryGuy.store.query('user', {})
        .catch(() => {
          assert.equal(mock.timesCalled, 1);
          assert.ok(true);
          done();
        });
    });
  });

  test("using returns with headers adds the headers to the response", function(assert) {
    var done = assert.async();
    const queryParams = {name: 'MyCompany'};
    const handler = mockQuery('company', queryParams);
    handler.returns({headers: {'X-Testing': 'absolutely'}});

    $(document).ajaxComplete(function(event, xhr) {
      assert.equal(xhr.getResponseHeader('X-Testing'), 'absolutely');
      $(document).off('ajaxComplete');
      done();
    });

    FactoryGuy.store.query('company', queryParams);
  });

  test("using nested search params", function(assert) {
    run(() => {
      let done = assert.async();

      let models = makeList('company', 2);

      mockQuery('company', {name: {like: 'Dude*'}}).returns({models});

      FactoryGuy.store.query('company', {name: {like: 'Dude*'}}).then(function(companies) {
        assert.deepEqual(A(companies).mapBy('id'), A(models).mapBy('id'));
        done();
      });
    });
  });

  test("using returns with empty array", function(assert) {
    run(() => {
      let done = assert.async();
      mockQuery('user', {name: 'Bob'}).returns({models: []});
      FactoryGuy.store.query('user', {name: 'Bob'}).then(function(users) {
        assert.equal(users.get('length'), 0, "nothing returned");
        done();
      });
    });
  });

  test("using returns with model instances returns your models, and does not create new ones", function(assert) {
    run(() => {
      let done = assert.async();
      let bob = make('user');

      mockQuery('user', {name: 'Bob'}).returns({models: [bob]});

      FactoryGuy.store.query('user', {name: 'Bob'}).then(function(users) {
        assert.equal(users.get('length'), 1);
        assert.equal(users.get('firstObject'), bob);
        assert.equal(FactoryGuy.store.peekAll('user').get('content').length, 1, "does not make another user");
        done();
      });
    });
  });

  test("using returns with model instances having hasMany models", async function(assert) {
    let models = makeList('user', 2, 'with_hats');
    mockQuery('user', {name: 'Bob'}).returns({models});

    assert.equal(FactoryGuy.store.peekAll('user').get('content.length'), 2, 'start out with 2 instances');

    let users = await Ember.run(async () => FactoryGuy.store.query('user', {name: 'Bob'}));
    assert.equal(users.get('length'), 2);
    assert.equal(users.get('firstObject.name'), 'User1');
    assert.equal(users.get('firstObject.hats.length'), 2);
    assert.equal(users.get('lastObject.name'), 'User2');
    assert.equal(FactoryGuy.store.peekAll('user').get('content.length'), 2, 'no new instances created');
  });

  test("using returns with model instances with hasMany and belongsTo relationships", function(assert) {
    run(() => {
      let done = assert.async();

      let models = makeList('company', 2, 'with_projects', 'with_profile');
      mockQuery('company', {name: 'Dude Company'}).returns({models});

      assert.equal(FactoryGuy.store.peekAll('company').get('content.length'), 2, 'start out with 2 instances');

      FactoryGuy.store.query('company', {name: 'Dude Company'}).then(function(companies) {
        assert.equal(companies.get('length'), 2);
        assert.ok(companies.get('firstObject.profile') instanceof Profile);
        assert.equal(companies.get('firstObject.projects.length'), 2);
        assert.ok(companies.get('lastObject.profile') instanceof Profile);
        assert.equal(companies.get('lastObject.projects.length'), 2);
        assert.equal(FactoryGuy.store.peekAll('company').get('content.length'), 2, 'no new instances created');
        done();
      });
    });
  });

  test("using returns with json returns and creates models", function(assert) {
    run(() => {
      let done = assert.async();

      let json = buildList('user', 1);
      mockQuery('user', {name: 'Bob'}).returns({json});
      FactoryGuy.store.query('user', {name: 'Bob'}).then(function(users) {
        assert.equal(users.get('length'), 1);
        // makes the user after getting query response
        assert.equal(FactoryGuy.store.peekAll('user').get('content').length, 1);
        done();
      });
    });
  });

  test("using returns with model ids returns those models and does not create new ones", function(assert) {
    run(() => {
      let done = assert.async();

      let bob = make('user');
      let ids = [bob.id];
      mockQuery('user', {name: 'Bob'}).returns({ids});

      FactoryGuy.store.query('user', {name: 'Bob'}).then(function(users) {
        assert.equal(users.get('length'), 1);
        assert.equal(users.get('firstObject'), bob);
        // does not create a new model
        assert.equal(FactoryGuy.store.peekAll('user').get('content').length, 1);
        done();
      });
    });
  });

  // test created for issue #143
  test("reuse mock query to first return nothing then use returns to return something", function(assert) {
    run(() => {
      let done = assert.async();
      let store = FactoryGuy.store;

      let bobQueryHander = mockQuery('user', {name: 'Bob'});

      store.query('user', {name: 'Bob'}).then(function(users) {
        assert.equal(users.get('length'), 0);

        mockCreate('user', {name: 'Bob'});
        store.createRecord('user', {name: 'Bob'}).save().then(function(user) {

          bobQueryHander.returns({models: [user]});

          store.query('user', {name: 'Bob'}).then(function(users) {
            assert.equal(users.get('length'), 1);
            done();
          });
        });
      });
    });
  });

  test("reusing mock query using returns with different models and different params returns different results", function(assert) {
    run(() => {
      let done = assert.async();

      let companies1 = makeList('company', 2);
      mockQuery('company', {name: 'Dude'}).returns({models: companies1});

      let companies2 = makeList('company', 2);
      mockQuery('company', {type: 'Small'}).returns({models: companies2});

      FactoryGuy.store.query('company', {name: 'Dude'}).then(function(companies) {
        assert.equal(A(companies).mapBy('id') + '', A(companies1).mapBy('id') + '');

        FactoryGuy.store.query('company', {type: 'Small'}).then(function(companies) {
          assert.equal(A(companies).mapBy('id') + '', A(companies2).mapBy('id') + '');
          done();
        });
      });
    });
  });


  test("using returns with same json and different query params returns same results", function(assert) {
    run(() => {
      let done = assert.async();
      let expectedAssertions = 2;

      function finalizeTest() {
        --expectedAssertions;
        if (expectedAssertions === 0) {
          done();
        }
      }

      let companies = makeList('company', 2);

      mockQuery('company', {name: 'Dude'}).returns({models: companies});
      mockQuery('company', {type: 'Small', name: 'Dude'}).returns({models: companies});

      let request1 = FactoryGuy.store.query('company', {name: 'Dude'});
      let request2 = FactoryGuy.store.query('company', {type: 'Small', name: 'Dude'});

      request1.then(function(returnedCompanies) {
        assert.equal(A(companies).mapBy('id') + '', A(returnedCompanies).mapBy('id') + '');
        finalizeTest();
      });

      request2.then(function(returnedCompanies) {
        assert.equal(A(companies).mapBy('id') + '', A(returnedCompanies).mapBy('id') + '');
        finalizeTest();
      });
    });
  });

  test("reusing mock query using returns with different models and withParams with different params returns different results", function(assert) {
    run(() => {
      let done = assert.async();

      let companies1 = makeList('company', 2);
      let companies2 = makeList('company', 2);

      let queryHandler = mockQuery('company', {name: 'Dude'}).returns({models: companies1});
      FactoryGuy.store.query('company', {name: 'Dude'}).then(function(companies) {
        assert.equal(A(companies).mapBy('id') + '', A(companies1).mapBy('id') + '');

        queryHandler.withParams({type: 'Small'}).returns({models: companies2});
        FactoryGuy.store.query('company', {type: 'Small'}).then(function(companies) {
          assert.equal(A(companies).mapBy('id') + '', A(companies2).mapBy('id') + '');
          done();
        });
      });
    });
  });

  test("mock query with withSomeParams captures the query even if it contains additional params", function(assert) {
    run(() => {
      let done = assert.async();

      let companies1 = makeList('company', 2);
      let companies2 = makeList('company', 2);

      let matchQueryHandler = mockQuery('company').withSomeParams({name: 'Dude'}).returns({models: companies1});
      let allQueryHandler = mockQuery('company').returns({models: companies2});

      FactoryGuy.store.query('company', {name: 'Dude', page: 1}).then(function(companies) {
        assert.equal(A(companies).mapBy('id') + '', A(companies1).mapBy('id') + '');
        assert.equal(matchQueryHandler.timesCalled, 1);
        FactoryGuy.store.query('company', {name: 'Other', page: 1}).then(function(companies) {
          assert.equal(A(companies).mapBy('id') + '', A(companies2).mapBy('id') + '');
          assert.equal(allQueryHandler.timesCalled, 1);
          done();
        });
      });
    });
  });

};

SharedBehavior.mockQueryMetaTests = function(serializer, serializerType) {

  moduleFor('serializer:application', `${serializer} #mockQuery | meta`, inlineSetup(serializerType));

  test("with proxy payload", function(assert) {
    run(() => {
      let done = assert.async();

      let json1 = buildList('profile', 2).add({meta: {previous: '/profiles?page=1', next: '/profiles?page=3'}});
      let json2 = buildList('profile', 2).add({meta: {previous: '/profiles?page=2', next: '/profiles?page=4'}});

      mockQuery('profile', {page: 2}).returns({json: json1});
      mockQuery('profile', {page: 3}).returns({json: json2});

      FactoryGuy.store.query('profile', {page: 2}).then(function(profiles) {
        assert.deepEqual(profiles.mapBy('id'), ["1", "2"]);
        assert.ok(isEquivalent(profiles.get('meta'), {previous: '/profiles?page=1', next: '/profiles?page=3'}));

        FactoryGuy.store.query('profile', {page: 3}).then(function(profiles2) {
          assert.deepEqual(profiles2.mapBy('id'), ["3", "4"]);
          assert.ok(isEquivalent(profiles2.get('meta'), {previous: '/profiles?page=2', next: '/profiles?page=4'}));
          done();
        });
      });
    });
  });

};

/////// mockQueryRecord //////////

SharedBehavior.mockQueryRecordTests = function() {

  test("when returning no result", async function(assert) {
    mockQueryRecord('user');

    FactoryGuy.store.queryRecord('user', {});

    assert.ok(true);
  });

  test("with no parameters matches queryRequest with any parameters", async function(assert) {
    mockQueryRecord('user').returns({json: build('user')});

    await FactoryGuy.store.queryRecord('user', {name: 'Bob'});

    assert.ok(true);
  });

  test("using returns with json returns and creates model", async function(assert) {
    run(async () => {
      let bob = build('user', {name: 'Bob'});
      mockQueryRecord('user', {name: 'Bob'}).returns({json: bob});

      let user = await FactoryGuy.store.queryRecord('user', {name: 'Bob'});
      assert.equal(user.id, bob.get('id'));
      assert.equal(user.get('name'), bob.get('name'));
      // makes the user after getting query response
      assert.equal(FactoryGuy.store.peekAll('user').get('content').length, 1);
    });
  });

  test("using returns with model instance returns that model, and does not create new one", async function(assert) {
    run(async () => {
      let bob = make('user');
      mockQueryRecord('user', {name: 'Bob'}).returns({model: bob});

      let user = await FactoryGuy.store.queryRecord('user', {name: 'Bob'});
      assert.equal(user, bob, "returns the same user");
      assert.equal(FactoryGuy.store.peekAll('user').get('content').length, 1, "does not create a new model");
    });
  });

  test("using returns with model id returns that model, and does not create new one", async function(assert) {
    run(async () => {
      let bob = make('user');
      mockQueryRecord('user', {name: 'Bob'}).returns({id: bob.id});

      let user = await FactoryGuy.store.queryRecord('user', {name: 'Bob'});
      assert.equal(user, bob, "returns the same user");
      assert.equal(FactoryGuy.store.peekAll('user').get('content').length, 1, "does not create a new model");
    });
  });

  test("twice using returns with different json and different params returns different results", async function(assert) {
    return run(async () => {

      let company1 = build('company'),
          company2 = build('company');

      mockQueryRecord('company', {name: 'Dude'}).returns({json: company1});
      mockQueryRecord('company', {type: 'Small'}).returns({json: company2});

      let company = await FactoryGuy.store.queryRecord('company', {name: 'Dude'});
      assert.equal(company.get('id'), company1.get('id'));

      company = await FactoryGuy.store.queryRecord('company', {type: 'Small'});
      assert.equal(company.get('id'), company2.get('id'));
    });
  });

  test("reusing mock using returns with different json and withParams with different params returns different results", async function(assert) {
    return run(async () => {
      let company1 = build('company'),
          company2 = build('company');

      let mockQuery = mockQueryRecord('company', {name: 'Dude'}).returns({json: company1});
      let company = await FactoryGuy.store.queryRecord('company', {name: 'Dude'});

      assert.equal(company.get('id'), company1.get('id'));

      mockQuery.withParams({type: 'Small'}).returns({json: company2});
      company = await FactoryGuy.store.queryRecord('company', {type: 'Small'});

      assert.equal(company.get('id'), company2.get('id'));
    });
  });

};

/////// mockCreate //////////

SharedBehavior.mockCreateTests = function() {

  test("the basic", async function(assert) {
    run(async () => {
      let customDescription = "special description";

      mockCreate('profile', {match: {description: customDescription}});

      assert.ok(FactoryGuy.store.peekAll('profile').get('content.length') === 0);

      let profile = FactoryGuy.store.createRecord('profile', {description: customDescription});
      await profile.save();

      assert.ok(FactoryGuy.store.peekAll('profile').get('content.length') === 1, 'No extra records created');
      assert.ok(profile instanceof Profile, 'Creates the correct type of record');
      assert.ok(profile.get('description') === customDescription, 'Passes along the match attributes');
    });
  });

  test("with dasherized model name", async function(assert) {
    run(async () => {
      let customName = "special name";

      mockCreate('super-hero', {match: {name: customName}});

      assert.ok(FactoryGuy.store.peekAll('super-hero').get('content.length') === 0);

      let hero = FactoryGuy.store.createRecord('super-hero', {name: customName});
      await hero.save();

      assert.ok(FactoryGuy.store.peekAll('super-hero').get('content.length') === 1, 'No extra records created');
      assert.ok(hero instanceof SuperHero, 'Creates the correct type of record');
      assert.ok(hero.get('name') === customName, 'Passes along the match attributes');
    });
  });

  test("with no specific match", async function(assert) {
    run(async () => {
      let profile = FactoryGuy.store.createRecord('profile', {description: 'whatever'})

      mockCreate('profile');

      await profile.save();

      assert.ok(profile.id === "1");
      assert.ok(profile.get('description') === 'whatever');
    });
  });

  test("with no specific match creates many in a loop", async function(assert) {
    run(async () => {
      mockCreate('profile');

      let profiles = [1, 2, 3].map(function() {
        return FactoryGuy.store.createRecord('profile', {description: 'whatever'});
      });

      await Ember.RSVP.all(profiles.map(profile => profile.save()));

      let ids = A(profiles).mapBy('id');
      let descriptions = A(profiles).mapBy('description');

      assert.deepEqual(ids, ['1', '2', '3']);
      assert.deepEqual(descriptions, ['whatever', 'whatever', 'whatever']);
    });
  });

  test("match can take a function - if it returns true it registers a match", async function(assert) {
    assert.expect(2);
    run(async () => {
      let mock = mockCreate('profile');

      mock.match(function() {
        assert.ok(true, 'matching function is called');
        return true;
      });

      await FactoryGuy.store.createRecord('profile').save();

      assert.equal(mock.timesCalled, 1);
    });
  });

  test("match can take a function - if it returns false it does not register a match", async function(assert) {
    assert.expect(3);
    run(async () => {
      let mock1 = mockCreate('profile'),
          mock2 = mockCreate('profile');

      mock1.match(function() {
        assert.ok(true, 'matching function is called');
        return false;
      });

      await FactoryGuy.store.createRecord('profile').save();

      assert.equal(mock1.timesCalled, 0);
      assert.equal(mock2.timesCalled, 1);
    });
  });

  test("match some attributes", async function(assert) {
    run(async () => {
      let customDescription = "special description",
          date              = new Date(),
          profile           = FactoryGuy.store.createRecord('profile', {
            description: customDescription, created_at: date
          })

      mockCreate('profile').match({description: customDescription});

      await profile.save();

      assert.ok(profile instanceof Profile);
      assert.ok(profile.id === '1');
      assert.ok(profile.get('description') === customDescription);
    });
  });

  test("match all attributes", async function(assert) {
    run(async () => {
      let customDescription = "special description",
          date              = new Date(),
          profile           = FactoryGuy.store.createRecord('profile', {
            description: customDescription, created_at: date
          });

      mockCreate('profile').match({description: customDescription, created_at: date});

      await profile.save()

      assert.ok(profile instanceof Profile);
      assert.ok(profile.id === '1');
      assert.ok(profile.get('description') === customDescription);
      assert.ok(profile.get('created_at').toString() === date.toString());
    });
  });

  test("match belongsTo association", async function(assert) {
    run(async () => {

      let company = make('company'),
          profile = FactoryGuy.store.createRecord('profile', {company: company});

      mockCreate('profile').match({company: company});

      await profile.save();

      assert.ok(profile.get('company') === company);
    });
  });

  test("match belongsTo polymorphic association", async function(assert) {
    run(async () => {
      let group   = make('big-group'),
          profile = FactoryGuy.store.createRecord('profile', {group: group});

      mockCreate('profile').match({group: group});

      await profile.save();

      assert.ok(profile.get('group') === group);
    });
  });

  test("using returns attrs with attributes", async function(assert) {
    run(async () => {
      let date    = new Date(),
          profile = FactoryGuy.store.createRecord('profile');

      mockCreate('profile').returns({attrs: {created_at: date}});

      await profile.save();

      assert.ok(profile.get('created_at').toString() === date.toString());
    });
  });

  test("using returns method with user-supplied model id", async function(assert) {
    let id = 42;

    mockCreate('profile').returns({attrs: {id: id}});

    let profile = run(() => FactoryGuy.store.createRecord('profile'));
    await run(async () => profile.save());

    assert.equal(profile.get('id'), id);
    assert.equal(profile.get('foo'), undefined);
  });

  test("match attributes and also return attributes", async function(assert) {
    run(async () => {

      let date              = new Date(2015, 1, 2, 3, 4, 5),
          customDescription = "special description",
          company           = make('company'),
          group             = make('big-group');

      mockCreate('profile')
        .match({description: customDescription, company: company, group: group})
        .returns({attrs: {created_at: date}});

      let profile = FactoryGuy.store.createRecord('profile', {
        description: customDescription, company: company, group: group
      });
      await profile.save();

      assert.ok(profile.get('created_at').toString() === date.toString());
      assert.ok(profile.get('group') === group);
      assert.ok(profile.get('company') === company);
      assert.ok(profile.get('description') === customDescription);
    });
  });


  test("failure with fails method", function(assert) {
    run(() => {
      let done = assert.async();

      let mock = mockCreate('profile').fails();

      FactoryGuy.store.createRecord('profile').save()
        .catch(() => {
          assert.ok(true);
          assert.equal(mock.timesCalled, 1);
          done();
        });
    });
  });

  test("fails when match args not present in createRecord attributes", function(assert) {
    run(() => {
      let done = assert.async();

      let mock = mockCreate('profile').match({description: 'correct description'});

      FactoryGuy.store.createRecord('profile', {description: 'wrong description'}).save()
        .catch(() => {
          assert.ok(true);
          // our mock was NOT called
          assert.equal(mock.timesCalled, 0);
          done();
        });
    });
  });

  test("match but still fail with fails method", function(assert) {
    run(() => {
      let done = assert.async();
      let description = "special description";

      let mock = mockCreate('profile').match({description: description}).fails();

      FactoryGuy.store.createRecord('profile', {description: description}).save()
        .catch(() => {
          assert.ok(true);
          assert.equal(mock.timesCalled, 1);

          done();
        });
    });
  });
};

SharedBehavior.mockCreateFailsWithErrorResponse = function(serializer, serializerType) {

  moduleFor('serializer:application', `${serializer} #mockCreate | fails with error response`, inlineSetup(serializerType));

  test("failure with status code 422 and errors in response with fails method", function(assert) {
    run(() => {
      let done = assert.async();

      let errors = {errors: {dog: ['bad dog'], dude: ['bad dude']}};
      let mock = mockCreate('profile').fails({status: 422, response: errors});

      let profile = FactoryGuy.store.createRecord('profile');
      profile.save()
        .catch(() => {
          let errorMessages = profile.get('errors.messages');
          assert.deepEqual(errorMessages, ['bad dog', 'bad dude']);
          assert.equal(mock.timesCalled, 1);
          assert.ok(true);
          done();
        });
    });
  });
};

SharedBehavior.mockCreateReturnsAssociations = function(serializer, serializerType) {

  moduleFor('serializer:application', `${serializer} #mockCreate | returns association`, inlineSetup(serializerType));

  test("belongsTo", async function(assert) {
    run(async () => {
      let company = build('company'),
          profile = FactoryGuy.store.createRecord('profile');

      mockCreate('profile').returns({attrs: {company}});

      await profile.save();

      assert.equal(profile.get('company.id'), company.get('id').toString());
      assert.equal(profile.get('company.name'), company.get('name'));
    });
  });

  test("belongsTo ( polymorphic )", async function(assert) {
    run(async () => {
      let person = build('super-hero'),
          outfit = FactoryGuy.store.createRecord('outfit');

      mockCreate('outfit').returns({attrs: {person}});

      await outfit.save()

      assert.equal(outfit.get('person.id'), person.get('id').toString());
      assert.equal(outfit.get('person.name'), person.get('name'));
    });
  });

  test("hasMany", async function(assert) {
    run(async () => {
      let outfits = buildList('outfit', 2),
          hero    = FactoryGuy.store.createRecord('super-hero');

      mockCreate('super-hero').returns({attrs: {outfits}});

      await hero.save();

      assert.deepEqual(hero.get('outfits').mapBy('id'), ['1', '2']);
      assert.deepEqual(hero.get('outfits').mapBy('name'), ['Outfit-1', 'Outfit-2']);
    });
  });

};

SharedBehavior.mockCreateReturnsEmbeddedAssociations = function(serializer, serializerType) {

  moduleFor('serializer:application', `${serializer} #mockCreate | returns embedded association`, inlineSetup(serializerType));

  test("belongsTo", async function(assert) {
    run(async () => {
      let company   = build('company'),
          comitBook = FactoryGuy.store.createRecord('comic-book');

      mockCreate('comic-book').returns({attrs: {company}});

      await comitBook.save();

      assert.equal(comitBook.get('company.id'), company.get('id').toString());
      assert.equal(comitBook.get('company.name'), company.get('name').toString());
    });
  });

};

/////// mockUpdate //////////

SharedBehavior.mockUpdateTests = function() {

  test("with modelType and id", async function(assert) {
    run(async () => {
      let profile = make('profile');
      mockUpdate('profile', profile.id);

      profile.set('description', 'new desc');
      await profile.save();

      assert.ok(profile.get('description') === 'new desc');
    });
  });

  test("with modelType and id using returns to return an attribute", async function(assert) {
    run(async () => {
      let profile = make('profile'),
          date    = new Date(2016, 1, 4);

      mockUpdate('profile', profile.id).returns({attrs: {created_at: date}});

      profile.set('description', 'new desc');
      await profile.save();

      assert.ok(profile.get('description') === 'new desc');
      assert.ok(profile.get('created_at').toString() === date.toString());
    });
  });

  test("with only modelType", async function(assert) {
    run(async () => {
      let profile = make('profile');
      mockUpdate('profile');

      profile.set('description', 'new desc');
      await profile.save();

      assert.equal(profile.get('description'), 'new desc');
    });
  });


  test("with model", async function(assert) {
    run(async () => {
      let profile = make('profile');
      mockUpdate(profile);

      profile.set('description', 'new desc');
      await profile.save();

      assert.equal(profile.get('description'), 'new desc');
    });
  });

  test("with model and query param", async function(assert) {
    run(async () => {
      let employee = make('employee');
      mockUpdate(employee);

      employee.set('gender', 'new gender');
      await employee.save();

      assert.equal(employee.get('gender'), 'new gender');
    });
  });

  test("with model using returns to return an attribute", async function(assert) {
    run(async () => {
      let profile = make('profile'),
          date    = new Date(2016, 1, 4);
      mockUpdate(profile).returns({attrs: {created_at: date}});

      profile.set('description', 'new desc');
      await profile.save();

      assert.ok(profile.get('description') === 'new desc');
      assert.ok(profile.get('created_at').toString() === date.toString());
    });
  });

  test("with model that has polymorphic belongsTo", async function(assert) {
    run(async () => {
      let group   = make('group'),
          profile = make('profile', {group: group});
      mockUpdate(profile);

      profile.set('description', 'new desc');
      await profile.save()

      assert.ok(profile.get('description') === 'new desc');
    });
  });


  test('with model that has model fragment as the updated field', async function(assert) {
    let employee = make('employee');

    mockUpdate(employee);

    assert.ok(!employee.get('hasDirtyAttributes'));
    run(() => employee.set('name.firstName', 'Jamie'));

    assert.ok(employee.get('name.firstName') === 'Jamie');
    assert.ok(employee.get('name.lastName') === 'Lannister');

    assert.ok(employee.get('hasDirtyAttributes'));

    await run(async () => employee.save());
    assert.ok(!employee.get('hasDirtyAttributes'));
  });

  test("with modelType and id that fails", async function(assert) {
    run(async () => {
      let profile = make('profile');

      mockUpdate('profile', profile.id).fails({status: 500});

      profile.set('description', 'new desc');
      await profile.save().catch(
        function(reason) {
          let error = reason.errors[0];
          assert.equal(error.status, "500");
        }
      );
    });
  });


  test("with model that fails with custom status", function(assert) {
    let done = assert.async();
    run(() => {
      let profile = make('profile');

      mockUpdate(profile).fails({status: 401});

      profile.set('description', 'new desc');
      profile.save().catch(
        function(reason) {
          let error = reason.errors[0];
          assert.equal(error.status, "401");
          done();
        }
      );
    });
  });

  test("with model that fails and then succeeds", function(assert) {
    run(() => {
      let done = assert.async();
      let profile = make('profile');

      let updateMock = mockUpdate(profile).fails();

      profile.set('description', 'new desc');
      profile.save()
        .catch(() => assert.ok(true, 'update failed the first time'))
        .then(() => {
          updateMock.succeeds();
          assert.ok(!profile.get('valid'), "Profile is invalid.");

          profile.save().then(() => {
              assert.ok(!profile.get('saving'), "Saved model");
              assert.ok(profile.get('description') === 'new desc', "Description was updated.");
              done();
            }
          );
        });
    });
  });

  test("match can take a function - if it returns true it registers a match", async function(assert) {
    assert.expect(2);
    run(async () => {
      let customDescription = "special description",
          profile           = make('profile'),
          updateMock        = mockUpdate(profile);

      updateMock.match(function(/*requestData*/) {
        assert.ok(true, 'matching function is called');
        return true;
      });

      profile.set('description', customDescription);
      await profile.save();

      assert.equal(updateMock.timesCalled, 1);
    });
  });

  test("match can take a function - if it returns false it does not register a match", async function(assert) {
    assert.expect(3);
    run(async () => {
      let customDescription = "special description",
          profile           = make('profile'),
          updateMock1       = mockUpdate(profile),
          updateMock2       = mockUpdate(profile);

      updateMock1.match(function() {
        assert.ok(true, 'updateMock1 matching function is called');
        return false;
      });

      profile.set('description', customDescription);
      await profile.save();

      assert.equal(updateMock1.timesCalled, 0);
      assert.equal(updateMock2.timesCalled, 1);
    });
  });

  test("match some attributes", async function(assert) {
    run(async () => {
      let customDescription = "special description",
          profile           = make('profile');

      mockUpdate('profile', profile.id).match({description: customDescription});

      profile.set('description', customDescription);
      await profile.save();

      assert.ok(profile instanceof Profile);
      assert.ok(profile.id === '1');
      assert.ok(profile.get('description') === customDescription);
    });
  });

  test("match some attributes with only modelType", async function(assert) {
    let customDescription = "special description",
        profile           = make('profile', {description: customDescription}),
        profile2          = make('profile', {description: customDescription});

    mockUpdate('profile').match({description: customDescription});

    await run(async () => profile.save());

    assert.ok(profile instanceof Profile);
    assert.ok(profile.id === '1');
    assert.ok(profile.get('description') === customDescription);

    await run(async () => profile2.save());

    assert.ok(profile2 instanceof Profile);
    assert.ok(profile2.id === '2');
    assert.ok(profile2.get('description') === customDescription);
  });

  //  test("match all attributes", async function(assert) {
  //    run(async () => {
  //      let date              = new Date(),
  //          profile           = make('profile', {created_at: date, aBooleanField: false}),
  //          customDescription = "special description";
  //
  //      mockUpdate('profile', profile.id).match({
  //        description: customDescription, created_at: date, aBooleanField: true
  //      });
  //
  //      profile.setProperties({description: customDescription, aBooleanField: true});
  //
  //      await profile.save();
  //
  //      assert.ok(profile instanceof Profile);
  //      assert.ok(profile.id === '1');
  //      assert.ok(profile.get('description') === customDescription);
  //      assert.ok(profile.get('created_at').toString() === date.toString());
  //      assert.ok(profile.get('aBooleanField') === true);
  //    });
  //  });
  //
  //  test("match belongsTo association", async function(assert) {
  //    run(async () => {
  //      let company = make('company'),
  //          profile = make('profile', {company: company});
  //
  //      mockUpdate('profile', profile.id).match({company: company});
  //
  //      await profile.save()
  //
  //      assert.ok(profile.get('company') === company);
  //    });
  //  });
  //
  //  test("match belongsTo polymorphic association", async function(assert) {
  //    run(async () => {
  //      let group = make('big-group');
  //      let profile = make('profile', {group: group});
  //      mockUpdate('profile', profile.id).match({group: group});
  //
  //      await profile.save();
  //      assert.ok(profile.get('group') === group);
  //    });
  //  });
  //
  //  test("match attributes and also return attributes", async function(assert) {
  //    run(async () => {
  //      let date              = new Date(2015, 1, 2, 3, 4, 5),
  //          customDescription = "special description",
  //          company           = make('company'),
  //          group             = make('big-group');
  //
  //      let profile = make('profile', {description: customDescription, company: company, group: group});
  //
  //      mockUpdate('profile', profile.id)
  //        .match({description: customDescription, company: company, group: group})
  //        .returns({attrs: {created_at: date}});
  //
  //      await profile.save();
  //
  //      assert.ok(profile.get('created_at').toString() === date.toString());
  //      assert.ok(profile.get('group') === group);
  //      assert.ok(profile.get('company') === company);
  //      assert.ok(profile.get('description') === customDescription);
  //    });
  //  });
  //
  //  test("fails when match args not present", function(assert) {
  //    run(() => {
  //      let done = assert.async();
  //      let profile = make('profile');
  //
  //      let mock = mockUpdate('profile', profile.id).match({description: 'correct description'});
  //
  //      profile.set('description', 'wrong description');
  //      profile.save()
  //        .catch(() => {
  //          assert.ok(true);
  //          assert.equal(mock.timesCalled, 0);
  //          done();
  //        });
  //    });
  //  });
  //
  //  test("succeeds then fails when match args not present with only modelType", function(assert) {
  //    run(() => {
  //      let done = assert.async();
  //      let customDescription = "special description";
  //      let profile = make('profile', {description: customDescription});
  //      let profile2 = make('profile');
  //
  //      let mock = mockUpdate('profile').match({description: customDescription});
  //
  //      profile.save()
  //        .then(() => {
  //          assert.ok(true);
  //          assert.equal(mock.timesCalled, 1);
  //
  //          profile2.save()
  //            .catch(() => {
  //              assert.ok(true);
  //              assert.equal(mock.timesCalled, 1);
  //              done();
  //            });
  //        });
  //    });
  //  });
  //
  //  test("match but still fail with fails method", function(assert) {
  //    run(() => {
  //      let done = assert.async();
  //      let description = "special description";
  //      let profile = make('profile', {description: description});
  //
  //      let mock = mockUpdate('profile', profile.id).match({description: description}).fails();
  //
  //      profile.save()
  //        .catch(() => {
  //          assert.ok(true);
  //          assert.equal(mock.timesCalled, 1);
  //          done();
  //        });
  //    });
  //  });
  //
  //  test("removes attributes based serializer attrs settings", async function(assert) {
  //    run(async () => {
  //      let serializer = FactoryGuy.store.serializerFor('profile');
  //      serializer.attrs = {
  //        created_at: {
  //          serialize: false
  //        }
  //      };
  //
  //      let date = new Date();
  //      let profile = make('profile');
  //      profile.set('created_at', date);
  //
  //      mockUpdate(profile)
  //        .match({created_at: null}) // serializer removes date
  //        .returns({attrs: {created_at: date}});
  //
  //      await profile.save();
  //
  //      assert.ok(profile.get('created_at').toString() === date.toString());
  //    });
  //  });

};

SharedBehavior.mockUpdateWithErrorMessages = function(serializer, serializerType) {

  moduleFor('serializer:application', `${serializer} #mockUpdate | error messages`, inlineSetup(serializerType));

  test("with model returns custom response", function(assert) {
    run(() => {
      let done = assert.async();
      let profile = make('profile');

      mockUpdate(profile).fails({
        status: 400,
        response: {errors: {description: ['invalid data']}},
        convertErrors: false
      });

      profile.set('description', 'new desc');
      profile.save().catch(
        function(reason) {
          let errors = reason.errors;
          assert.equal(errors.description, "invalid data", "custom description shows up in errors");
          done();
        }
      );
    });
  });
};


SharedBehavior.mockUpdateReturnsAssociations = function(serializer, serializerType) {

  moduleFor('serializer:application', `${serializer} #mockUpdate | returns association`, inlineSetup(serializerType));

  test("belongsTo", async function(assert) {
    run(async () => {
      let profile = make('profile');
      profile.set('description', 'new desc');

      let company = build('company');
      mockUpdate(profile).returns({attrs: {company}});

      await profile.save();

      assert.equal(profile.get('company.id'), company.get('id').toString());
      assert.equal(profile.get('company.name'), company.get('name'));
    });
  });

  test("belongsTo ( polymorphic )", async function(assert) {
    run(async () => {
      let newValue = 'new name',
          outfit   = make('outfit');
      outfit.set('name', newValue);

      let person = build('super-hero');
      mockUpdate(outfit).returns({attrs: {person}});

      await outfit.save();

      assert.equal(outfit.get('name'), newValue);
      assert.equal(outfit.get('person.id'), person.get('id').toString());
      assert.equal(outfit.get('person.name'), person.get('name'));
    });
  });

  test("hasMany", async function(assert) {
    run(async () => {
      let newValue = 'BoringMan',
          hero     = make('bat_man');
      hero.set('name', newValue);

      let outfits = buildList('outfit', 2);
      mockUpdate(hero).returns({attrs: {outfits}});

      await hero.save();

      assert.equal(hero.get('name'), newValue);
      assert.deepEqual(hero.get('outfits').mapBy('id'), ['1', '2']);
      assert.deepEqual(hero.get('outfits').mapBy('name'), ['Outfit-1', 'Outfit-2']);
    });
  });
};

SharedBehavior.mockUpdateReturnsEmbeddedAssociations = function(serializer, serializerType) {

  moduleFor('serializer:application', `${serializer} #mockUpdate | returns embedded association`, inlineSetup(serializerType));

  test("belongsTo", async function(assert) {
    run(async () => {
      let newValue  = 'new name',
          comicBook = make('comic-book', {characters: []});
      comicBook.set('name', newValue);

      let company = build('company');
      mockUpdate(comicBook).returns({attrs: {company}});

      await comicBook.save();

      assert.equal(comicBook.get('name'), newValue);
      assert.equal(comicBook.get('company.id'), company.get('id').toString());
      assert.equal(comicBook.get('company.name'), company.get('name').toString());
    });
  });

};

/////// mockDelete //////////

SharedBehavior.mockDeleteTests = function() {
  test("with modelType", function(assert) {
    run(() => {
      let done = assert.async();
      let profiles = makeList('profile', 2);
      let profile = profiles[0];
      mockDelete('profile');

      assert.equal(FactoryGuy.store.peekAll('profile').get('content.length'), 2);

      profile.destroyRecord().then(function() {
        assert.equal(FactoryGuy.store.peekAll('profile').get('content.length'), 1);
        done();
      });
    });
  });

  test("with modelType and id", function(assert) {
    run(() => {
      let done = assert.async();
      let profile = make('profile');
      mockDelete('profile', profile.id);

      profile.destroyRecord().then(function() {
        assert.equal(FactoryGuy.store.peekAll('profile').get('content.length'), 0);
        done();
      });
    });
  });

  test("with model", function(assert) {
    run(() => {
      let done = assert.async();
      let profile = make('profile');
      mockDelete(profile);

      profile.destroyRecord().then(function() {
        assert.equal(FactoryGuy.store.peekAll('profile').get('content.length'), 0);
        done();
      });
    });
  });

  test("with model and query param", function(assert) {
    run(() => {
      let done = assert.async();
      let employee = make('employee');
      mockDelete(employee);

      employee.destroyRecord().then(function() {
        assert.equal(FactoryGuy.store.peekAll('employee').get('content.length'), 0);
        done();
      });
    });
  });

  test("with modelType that fails", function(assert) {
    run(() => {
      let done = assert.async();
      let profiles = makeList('profile', 2);
      let profile = profiles[0];
      let mock = mockDelete('profile').fails({status: 500});

      profile.destroyRecord().catch(function(reason) {
        let error = reason.errors[0];
        assert.equal(error.status, "500");
        assert.equal(mock.timesCalled, 1);
        assert.ok(true);
        done();
      });
    });
  });

  test("with modelType and id that fails", function(assert) {
    run(() => {
      let done = assert.async();
      let profile = make('profile');
      let mock = mockDelete('profile', profile.id).fails({status: 500});

      profile.destroyRecord().catch(function(reason) {
        let error = reason.errors[0];
        assert.equal(error.status, "500");
        assert.equal(mock.timesCalled, 1);
        assert.ok(true);
        done();
      });
    });
  });

  test("with model that fails with custom status", function(assert) {
    let done = assert.async();
    run(() => {
      let profile = make('profile');

      mockDelete(profile).fails({status: 401});

      profile.destroyRecord().catch(
        function(reason) {
          let error = reason.errors[0];
          assert.equal(error.status, "401");
          done();
        }
      );
    });
  });

  test("with modelType that fails and then succeeds", function(assert) {
    run(() => {
      let done = assert.async();
      let profiles = makeList('profile', 2);
      let profile = profiles[0];
      let deleteMock = mockDelete('profile').fails();

      profile.destroyRecord()
        .catch(() => assert.ok(true, 'delete failed the first time'))
        .then(() => {
          deleteMock.succeeds();

          profile.destroyRecord().then(function() {
            assert.equal(FactoryGuy.store.peekAll('profile').get('content.length'), 1);
            done();
          });
        });
    });
  });

  test("with modelType and id that fails and then succeeds", function(assert) {
    run(() => {
      let done = assert.async();
      let profile = make('profile');

      let deleteMock = mockDelete('profile', profile.id).fails();

      profile.destroyRecord()
        .catch(() => assert.ok(true, 'delete failed the first time'))
        .then(() => {
          deleteMock.succeeds();

          profile.destroyRecord().then(function() {
            assert.equal(FactoryGuy.store.peekAll('profile').get('content.length'), 0);
            done();
          });
        });
    });
  });

  test("with model that fails and then succeeds", function(assert) {
    run(() => {
      let done = assert.async();
      let profile = make('profile');

      let deleteMock = mockDelete(profile).fails();

      profile.destroyRecord()
        .catch(() => assert.ok(true, 'delete failed the first time'))
        .then(() => {
          deleteMock.succeeds();

          profile.destroyRecord().then(function() {
            assert.equal(FactoryGuy.store.peekAll('profile').get('content.length'), 0);
            done();
          });
        });
    });
  });
};

export default SharedBehavior;
