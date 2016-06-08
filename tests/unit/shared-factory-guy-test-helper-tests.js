import Ember from 'ember';
import FactoryGuy, {make, makeList, build, buildList} from 'ember-data-factory-guy';
import {isEquivalent} from 'ember-data-factory-guy/utils/helper-functions';

import {
  mockSetup, mockTeardown,
  mockFind, mockFindAll, mockReload, mockQuery,
  mockQueryRecord, mockCreate, mockUpdate, mockDelete
} from 'ember-data-factory-guy';
import MissingSequenceError from 'ember-data-factory-guy/missing-sequence-error';
import $ from 'jquery';
import {title, inlineSetup} from '../helpers/utility-methods';

import Profile from 'dummy/models/profile';
import SuperHero from 'dummy/models/super-hero';

const A = Ember.A;
let SharedBehavior = {};


//////// mockFind common /////////
SharedBehavior.mockFindCommonTests = function() {

  test("the basic returns id", function(assert) {
    Ember.run(()=> {
      let done = assert.async();
      let profile = mockFind('profile');
      let profileId = profile.get('id');

      FactoryGuy.store.find('profile', profileId).then(function(profile) {
        equal(profile.get('id'), profileId);
        equal(profile.get('description'), 'Text goes here');
        done();
      });
    });
  });

  test("with fixture options", function(assert) {
    Ember.run(()=> {
      let done = assert.async();
      let profile = mockFind('profile', { description: 'dude' });
      let profileId = profile.get('id');

      FactoryGuy.store.find('profile', profileId).then(function(profile) {
        ok(profile.get('description') === 'dude');
        done();
      });
    });
  });

  test("handles differently cased attributes", function(assert) {
    Ember.run(()=> {
      let done = assert.async();

      let profile = mockFind('profile');
      let profileId = profile.get('id');

      FactoryGuy.store.find('profile', profileId).then(function(profile) {
        ok(profile.get('camelCaseDescription') === 'textGoesHere');
        ok(profile.get('snake_case_description') === 'text_goes_here');
        done();
      });
    });
  });

  test("with traits", function(assert) {
    Ember.run(()=> {
      let done = assert.async();

      let profile = mockFind('profile', 'goofy_description');
      let profileId = profile.get('id');

      FactoryGuy.store.find('profile', profileId).then(function(profile) {
        ok(profile.get('description') === 'goofy');
        done();
      });
    });
  });

  test("with traits and extra options", function(assert) {
    Ember.run(()=> {
      let done = assert.async();

      let profile = mockFind('profile', 'goofy_description', { description: 'dude' });
      let profileId = profile.get('id');

      FactoryGuy.store.find('profile', profileId).then(function(profile) {
        ok(profile.get('description') === 'dude');
        done();
      });
    });
  });

};

SharedBehavior.mockFindSideloadingTests = function(App, adapter, serializerType) {

  module(title(adapter, '#mockFind | sideloading'), inlineSetup(App, serializerType));

  test("belongsTo association", function(assert) {
    Ember.run(()=> {
      let done = assert.async();
      let profile = mockFind('profile', 'with_company', 'with_bat_man');
      let profileId = profile.get('id');

      FactoryGuy.store.find('profile', profileId).then(function(profile) {
        ok(profile.get('company.name') === 'Silly corp');
        ok(profile.get('superHero.name') === 'BatMan');
        done();
      });
    });
  });


  test("hasMany association", function(assert) {
    Ember.run(()=> {
      let done = assert.async();
      let user = mockFind('user', 'with_hats');
      let userId = user.get('id');

      FactoryGuy.store.find('user', userId).then(function(user) {
        ok(user.get('hats.length') === 2);
        ok(user.get('hats.firstObject.type') === 'BigHat');
        done();
      });
    });
  });

  test("using returns with json", function(assert) {
    Ember.run(()=> {
      let done = assert.async();

      let json = build('profile', 'with_company', 'with_bat_man');

      mockFind('profile').returns({ json });
      let profileId = json.get('id');

      FactoryGuy.store.find('profile', profileId).then(function(profile) {
        ok(profile.get('company.name') === 'Silly corp');
        ok(profile.get('superHero.name') === 'BatMan');
        done();
      });
    });
  });

  test("using returns with json with composed hasMany association", function(assert) {
    Ember.run(()=> {
      let done = assert.async();

      let hat1 = build('big-hat');
      let hat2 = build('big-hat');
      let json = build('user', { hats: [hat1, hat2] });

      mockFind('user').returns({ json });

      FactoryGuy.store.find('user', json.get('id')).then(function(user) {
        ok(user.get('hats.firstObject.id') === hat1.get('id') + '');
        ok(user.get('hats.lastObject.id') === hat2.get('id') + '');
        done();
      });
    });
  });

  test("using returns with model", function(assert) {
    Ember.run(()=> {
      let done = assert.async();

      let model = make('profile', 'with_company', 'with_bat_man');
      let profile = mockFind('profile').returns({ model });
      let profileId = profile.get('id');

      FactoryGuy.store.find('profile', profileId).then(function(profile) {
        ok(profile.get('company.name') === 'Silly corp');
        ok(profile.get('superHero.name') === 'BatMan');
        equal(FactoryGuy.store.peekAll('profile').get('content').length, 1, "does not make another profile");
        done();
      });
    });
  });
};

SharedBehavior.mockFindEmbeddedTests = function(App, adapter, serializerType) {

  module(title(adapter, '#mockFind | embedded'), inlineSetup(App, serializerType));

  test("belongsTo", function(assert) {
    Ember.run(()=> {
      let done = assert.async();
      let mock = mockFind('comic-book', 'marvel');

      FactoryGuy.store.find('comic-book', mock.get('id')).then(function(comic) {
        ok(comic.get('name') === 'Comic Times #1');
        ok(comic.get('company.name') === 'Marvel Comics');
        done();
      });
    });
  });

  test("hasMany", function(assert) {
    Ember.run(()=> {
      let done = assert.async();
      let mock = mockFind('comic-book', 'with_bad_guys');

      FactoryGuy.store.find('comic-book', mock.get('id')).then(function(comic) {
        ok(comic.get('name') === 'Comic Times #1');
        ok(comic.get('characters').mapBy('name') + '' === ['BadGuy#1', 'BadGuy#2'] + '');
        done();
      });
    });
  });
};

//////// mockReload /////////

SharedBehavior.mockReloadTests = function() {

  test("with a record handles reload, and does not change attributes", function(assert) {
    let done = assert.async();
    Ember.run(()=> {
      let profile = make('profile', { description: "whatever" });
      mockReload(profile);

      profile.reload().then(function(reloaded) {
        ok(reloaded.id === profile.id);
        ok(reloaded.get('description') === profile.get('description'));
        done();
      });
    });
  });

  test("can change the attributes returned using returns method", function(assert) {
    let done = assert.async();
    Ember.run(()=> {
      let profile = make('profile', { description: "whatever", camelCaseDescription: "noodles" });

      mockReload(profile).returns({ attrs: { description: "moo" } });

      profile.reload().then(function(reloaded) {
        ok(reloaded.id === profile.id);
        ok(reloaded.get('description') === "moo", "attribute changed");
        ok(reloaded.get('camelCaseDescription') === "noodles", "other attributes are same");
        done();
      });
    });
  });

  test("failure with fails method", function(assert) {
    Ember.run(()=> {
      let done = assert.async();
      let mock = mockReload('profile', 1).fails();

      FactoryGuy.store.find('profile', 1)
        .catch(()=> {
            equal(mock.timesCalled, 1);
            ok(true);
            done();
          }
        );
    });
  });

};

/////// mockFindAll common //////////
SharedBehavior.mockFindAllCommonTests = function() {

  test("the basic", function(assert) {
    Ember.run(()=> {
      let done = assert.async();
      mockFindAll('user', 2);

      FactoryGuy.store.findAll('user').then(function(users) {
        ok(users.get('length') === 2);
        done();
      });
    });
  });

  test("handles differently cased attributes", function(assert) {
    Ember.run(()=> {
      let done = assert.async();

      mockFindAll('profile', 1);

      FactoryGuy.store.findAll('profile').then(function(profiles) {
        ok(profiles.get('firstObject.camelCaseDescription') === 'textGoesHere');
        ok(profiles.get('firstObject.snake_case_description') === 'text_goes_here');
        done();
      });
    });
  });

  test("asking for no return records", function(assert) {
    Ember.run(()=> {
      let done = assert.async();
      mockFindAll('user', 0);

      FactoryGuy.store.findAll('user').then(function(profiles) {
        ok(profiles.get('length') === 0);
        done();
      });
    });
  });

  test("with fixture options", function(assert) {
    Ember.run(()=> {
      let done = assert.async();
      mockFindAll('profile', 2, { description: 'dude' });

      FactoryGuy.store.findAll('profile').then(function(profiles) {
        ok(profiles.get('length') === 2);
        ok(profiles.get('firstObject.description') === 'dude');
        done();
      });
    });
  });

  test("with traits", function(assert) {
    let done = assert.async();
    mockFindAll('profile', 2, 'goofy_description');

    FactoryGuy.store.findAll('profile').then(function(profiles) {
      ok(profiles.get('length') === 2);
      ok(profiles.get('firstObject.description') === 'goofy');
      done();
    });
  });

  test("with traits and extra options", function(assert) {
    let done = assert.async();
    mockFindAll('profile', 2, 'goofy_description', { description: 'dude' });

    FactoryGuy.store.findAll('profile').then(function(profiles) {
      ok(profiles.get('length') === 2);
      ok(profiles.get('firstObject.description') === 'dude');
      done();
    });
  });
};

//////// mockFindAll with sideloading /////////
SharedBehavior.mockFindAllSideloadingTests = function(App, adapter, serializerType) {

  module(title(adapter, '#mockFindAll | sideloading'), inlineSetup(App, serializerType));

  test("with belongsTo association", function(assert) {
    Ember.run(()=> {
      let done = assert.async();
      mockFindAll('profile', 2, 'with_company', 'with_bat_man');

      FactoryGuy.store.findAll('profile').then(function(profiles) {
        ok(profiles.get('length') === 2);
        ok(profiles.get('firstObject.company.name') === 'Silly corp');
        ok(profiles.get('lastObject.superHero.name') === 'BatMan');
        done();
      });
    });
  });


  test("with hasMany association", function(assert) {
    Ember.run(()=> {
      let done = assert.async();

      mockFindAll('user', 2, 'with_hats');

      FactoryGuy.store.findAll('user').then(function(users) {
        ok(users.get('length') === 2);
        ok(A(users.get('lastObject.hats')).mapBy('type') + '' === ['BigHat', 'BigHat'] + '');
        ok(A(users.get('lastObject.hats')).mapBy('id') + '' === [3, 4] + '');
        done();
      });
    });
  });

  test("with diverse models", function(assert) {
    Ember.run(()=> {
      let done = assert.async();
      mockFindAll('profile', 'goofy_description', { description: 'foo' }, ['goofy_description', { aBooleanField: true }]);

      FactoryGuy.store.findAll('profile').then(function(profiles) {
        ok(profiles.get('length') === 3);
        ok(A(profiles).objectAt(0).get('description') === 'goofy');
        ok(A(profiles).objectAt(0).get('aBooleanField') === false);
        ok(A(profiles).objectAt(1).get('description') === 'foo');
        ok(A(profiles).objectAt(1).get('aBooleanField') === false);
        ok(A(profiles).objectAt(2).get('description') === 'goofy');
        ok(A(profiles).objectAt(2).get('aBooleanField') === true);
        done();
      });
    });
  });

  test("using returns with json", function(assert) {
    Ember.run(()=> {
      let done = assert.async();

      let json = buildList('profile', 'with_company', 'with_bat_man');
      mockFindAll('profile').returns({ json });

      FactoryGuy.store.findAll('profile').then(function(profiles) {
        ok(profiles.get('firstObject.company.name') === 'Silly corp');
        ok(profiles.get('lastObject.superHero.name') === 'BatMan');
        done();
      });
    });
  });

  test("using returns with model", function(assert) {
    Ember.run(()=> {
      let done = assert.async();

      let models = makeList('profile', 'with_company', 'with_bat_man');
      mockFindAll('profile').returns({ models });

      FactoryGuy.store.findAll('profile').then(function(profiles) {
        ok(profiles.get('firstObject.company.name') === 'Silly corp');
        ok(profiles.get('lastObject.superHero.name') === 'BatMan');
        equal(FactoryGuy.store.peekAll('profile').get('content').length, 2, "does not make new profiles");
        done();
      });
    });
  });

//  test("handles include params", function(assert) {
//    Ember.run(()=> {
//      let done = assert.async();
//
//      let json = buildList('profile', 'with_company');
//      mockFindAll('profile').withParams({include: 'company'}).returns({ json });
//
//      FactoryGuy.store.findAll('profile', {inlcude: 'company'}).then(function(profiles) {
//        ok(profiles.get('firstObject.company.name') === 'Silly corp');
//        done();
//      });
//    });
//  });

};

SharedBehavior.mockFindAllEmbeddedTests = function(App, adapter, serializerType) {

  module(title(adapter, '#mockFindAll | embedded'), inlineSetup(App, serializerType));

  test("belongsTo", function(assert) {
    Ember.run(()=> {
      let done = assert.async();

      mockFindAll('comic-book', 2, 'marvel');

      FactoryGuy.store.findAll('comic-book').then(function(comics) {
        ok(comics.mapBy('name') + '' === ['Comic Times #1', 'Comic Times #2'] + '');
        ok(comics.mapBy('company.name') + '' === ['Marvel Comics', 'Marvel Comics'] + '');
        done();
      });
    });
  });

  test("hasMany", function(assert) {
    Ember.run(()=> {
      let done = assert.async();

      mockFindAll('comic-book', 2, 'with_bad_guys');

      FactoryGuy.store.findAll('comic-book').then(function(comics) {
        ok(comics.mapBy('name') + '' === ['Comic Times #1', 'Comic Times #2'] + '');
        ok(comics.get('firstObject.characters').mapBy('name') + '' === ['BadGuy#1', 'BadGuy#2'] + '');
        ok(comics.get('lastObject.characters').mapBy('name') + '' === ['BadGuy#3', 'BadGuy#4'] + '');
        done();
      });
    });
  });
};

/////// mockQuery //////////

SharedBehavior.mockQueryTests = function() {

  test("not using returns", function(assert) {
    Ember.run(()=> {
      let done = assert.async();
      mockQuery('user', { name: 'Bob' });
      FactoryGuy.store.query('user', { name: 'Bob' }).then(function(users) {
        equal(users.get('length'), 0, "nothing returned");
        done();
      });
    });
  });

  test("with no parameters matches query with any parameters", function(assert) {
    var done = assert.async();
    mockQuery('user');
    FactoryGuy.store.query('user', { name: 'Bob' })
      .then(()=> {
        ok(true);
        done();
      });
  });

  test("using fails makes the request fail", function(assert) {
    Ember.run(()=> {
      let done = assert.async();

      let errors = { errors: { name: ['wrong'] } };

      let mock = mockQuery('user').fails({ status: 422, response: errors });
      FactoryGuy.store.query('user', {})
        .catch(()=> {
          equal(mock.timesCalled, 1);
          ok(true);
          done();
        });
    });
  });

  test("using returns with headers adds the headers to the response", function(assert) {
    var done = assert.async();
    const queryParams = { name: 'MyCompany' };
    const handler = mockQuery('company', queryParams);
    handler.returns({ headers: { 'X-Testing': 'absolutely' } });

    $(document).ajaxComplete(function(event, xhr) {
      assert.equal(xhr.getResponseHeader('X-Testing'), 'absolutely');
      $(document).off('ajaxComplete');
      done();
    });

    FactoryGuy.store.query('company', queryParams);
  });

  test("using nested search params", function(assert) {
    Ember.run(()=> {
      let done = assert.async();

      let models = makeList('company', 2);

      mockQuery('company', { name: { like: 'Dude*' } }).returns({ models });

      FactoryGuy.store.query('company', { name: { like: 'Dude*' } }).then(function(companies) {
        deepEqual(A(companies).mapBy('id'), A(models).mapBy('id'));
        done();
      });
    });
  });

  test("using returns with empty array", function(assert) {
    Ember.run(()=> {
      let done = assert.async();
      mockQuery('user', { name: 'Bob' }).returns({ models: [] });
      FactoryGuy.store.query('user', { name: 'Bob' }).then(function(users) {
        equal(users.get('length'), 0, "nothing returned");
        done();
      });
    });
  });

  test("using returns with model instances returns your models, and does not create new ones", function(assert) {
    Ember.run(()=> {
      let done = assert.async();
      let bob = make('user');

      mockQuery('user', { name: 'Bob' }).returns({ models: [bob] });

      FactoryGuy.store.query('user', { name: 'Bob' }).then(function(users) {
        equal(users.get('length'), 1);
        equal(users.get('firstObject'), bob);
        equal(FactoryGuy.store.peekAll('user').get('content').length, 1, "does not make another user");
        done();
      });
    });
  });

  test("using returns with model instances having hasMany models", function(assert) {
    Ember.run(()=> {
      let done = assert.async();

      let models = makeList('user', 2, 'with_hats');
      mockQuery('user', { name: 'Bob' }).returns({ models });

      equal(FactoryGuy.store.peekAll('user').get('content.length'), 2, 'start out with 2 instances');

      FactoryGuy.store.query('user', { name: 'Bob' }).then(function(users) {
        equal(users.get('length'), 2);
        equal(users.get('firstObject.name'), 'User1');
        equal(users.get('firstObject.hats.length'), 2);
        equal(users.get('lastObject.name'), 'User2');
        equal(FactoryGuy.store.peekAll('user').get('content.length'), 2, 'no new instances created');
        done();
      });
    });
  });

  test("using returns with model instances with hasMany and belongsTo relationships", function(assert) {
    Ember.run(()=> {
      let done = assert.async();

      let models = makeList('company', 2, 'with_projects', 'with_profile');
      mockQuery('company', { name: 'Dude Company' }).returns({ models });

      equal(FactoryGuy.store.peekAll('company').get('content.length'), 2, 'start out with 2 instances');

      FactoryGuy.store.query('company', { name: 'Dude Company' }).then(function(companies) {
        equal(companies.get('length'), 2);
        ok(companies.get('firstObject.profile') instanceof Profile);
        equal(companies.get('firstObject.projects.length'), 2);
        ok(companies.get('lastObject.profile') instanceof Profile);
        equal(companies.get('lastObject.projects.length'), 2);
        equal(FactoryGuy.store.peekAll('company').get('content.length'), 2, 'no new instances created');
        done();
      });
    });
  });

  test("using returns with json returns and creates models", function(assert) {
    Ember.run(()=> {
      let done = assert.async();

      let json = buildList('user', 1);
      mockQuery('user', { name: 'Bob' }).returns({ json });
      FactoryGuy.store.query('user', { name: 'Bob' }).then(function(users) {
        equal(users.get('length'), 1);
        // makes the user after getting query response
        equal(FactoryGuy.store.peekAll('user').get('content').length, 1);
        done();
      });
    });
  });

  test("using returns with model ids returns those models and does not create new ones", function(assert) {
    Ember.run(()=> {
      let done = assert.async();

      let bob = make('user');
      let ids = [bob.id];
      mockQuery('user', { name: 'Bob' }).returns({ ids });

      FactoryGuy.store.query('user', { name: 'Bob' }).then(function(users) {
        equal(users.get('length'), 1);
        equal(users.get('firstObject'), bob);
        // does not create a new model
        equal(FactoryGuy.store.peekAll('user').get('content').length, 1);
        done();
      });
    });
  });

  // test created for issue #143
  test("reuse mock query to first return nothing then use returns to return something", function(assert) {
    Ember.run(()=> {
      let done = assert.async();
      let store = FactoryGuy.store;

      let bobQueryHander = mockQuery('user', { name: 'Bob' });

      store.query('user', { name: 'Bob' }).then(function(users) {
        equal(users.get('length'), 0);

        mockCreate('user', { name: 'Bob' });
        store.createRecord('user', { name: 'Bob' }).save().then(function(user) {

          bobQueryHander.returns({ models: [user] });

          store.query('user', { name: 'Bob' }).then(function(users) {
            equal(users.get('length'), 1);
            done();
          });
        });
      });
    });
  });

  test("reusing mock query using returns with differnet models and different params returns different results", function(assert) {
    Ember.run(()=> {
      let done = assert.async();

      let companies1 = makeList('company', 2);
      mockQuery('company', { name: 'Dude' }).returns({ models: companies1 });

      let companies2 = makeList('company', 2);
      mockQuery('company', { type: 'Small' }).returns({ models: companies2 });

      FactoryGuy.store.query('company', { name: 'Dude' }).then(function(companies) {
        equal(A(companies).mapBy('id') + '', A(companies1).mapBy('id') + '');

        FactoryGuy.store.query('company', { type: 'Small' }).then(function(companies) {
          equal(A(companies).mapBy('id') + '', A(companies2).mapBy('id') + '');
          done();
        });
      });
    });
  });


  test("using returns with same json and different query params returns same results", function(assert) {
    Ember.run(()=> {
      let done = assert.async();
      let expectedAssertions = 2;

      function finalizeTest() {
        --expectedAssertions;
        if (expectedAssertions === 0) {
          done();
        }
      }

      let companies = makeList('company', 2);

      mockQuery('company', { name: 'Dude' }).returns({ models: companies });
      mockQuery('company', { type: 'Small', name: 'Dude' }).returns({ models: companies });

      let request1 = FactoryGuy.store.query('company', { name: 'Dude' });
      let request2 = FactoryGuy.store.query('company', { type: 'Small', name: 'Dude' });

      request1.then(function(returnedCompanies) {
        equal(A(companies).mapBy('id') + '', A(returnedCompanies).mapBy('id') + '');
        finalizeTest();
      });

      request2.then(function(returnedCompanies) {
        equal(A(companies).mapBy('id') + '', A(returnedCompanies).mapBy('id') + '');
        finalizeTest();
      });
    });
  });

  test("reusing mock query using returns with differnt models and withParams with different params returns different results", function(assert) {
    Ember.run(()=> {
      let done = assert.async();

      let companies1 = makeList('company', 2);
      let companies2 = makeList('company', 2);

      let queryHandler = mockQuery('company', { name: 'Dude' }).returns({ models: companies1 });
      FactoryGuy.store.query('company', { name: 'Dude' }).then(function(companies) {
        equal(A(companies).mapBy('id') + '', A(companies1).mapBy('id') + '');

        queryHandler.withParams({ type: 'Small' }).returns({ models: companies2 });
        FactoryGuy.store.query('company', { type: 'Small' }).then(function(companies) {
          equal(A(companies).mapBy('id') + '', A(companies2).mapBy('id') + '');
          done();
        });
      });
    });
  });

};

SharedBehavior.mockQueryMetaTests = function(App, adapter, serializerType) {

  module(title(adapter, '#mockQuery | meta'), inlineSetup(App, serializerType));

  test("with proxy payload", function(assert) {
    Ember.run(()=> {
      let done = assert.async();

      let json1 = buildList('profile', 2).add({ meta: { previous: '/profiles?page=1', next: '/profiles?page=3' } });
      let json2 = buildList('profile', 2).add({ meta: { previous: '/profiles?page=2', next: '/profiles?page=4' } });

      mockQuery('profile', { page: 2 }).returns({ json: json1 });
      mockQuery('profile', { page: 3 }).returns({ json: json2 });

      FactoryGuy.store.query('profile', { page: 2 }).then(function(profiles) {
        deepEqual(profiles.mapBy('id'), ["1", "2"]);
        ok(isEquivalent(profiles.get('meta'), { previous: '/profiles?page=1', next: '/profiles?page=3' }));

        FactoryGuy.store.query('profile', { page: 3 }).then(function(profiles2) {
          deepEqual(profiles2.mapBy('id'), ["3", "4"]);
          ok(isEquivalent(profiles2.get('meta'), { previous: '/profiles?page=2', next: '/profiles?page=4' }));
          done();
        });
      });
    });
  });

};

/////// mockQueryRecord //////////

SharedBehavior.mockQueryRecordTests = function() {

  test("when returning no result", function(assert) {
    var done = assert.async();
    mockQueryRecord('user');
    FactoryGuy.store.queryRecord('user', {})
      .then(()=> {
        ok(true);
        done();
      });
  });

  test("with no parameters matches queryRequest with any parameters", function(assert) {
    var done = assert.async();
    mockQueryRecord('user').returns({ json: build('user') });
    FactoryGuy.store.queryRecord('user', { name: 'Bob' })
      .then(()=> {
        ok(true);
        done();
      });
  });

  test("using returns with json returns and creates model", function(assert) {
    Ember.run(()=> {
      let done = assert.async();

      let bob = build('user', { name: 'Bob' });
      mockQueryRecord('user', { name: 'Bob' }).returns({ json: bob });
      FactoryGuy.store.queryRecord('user', { name: 'Bob' }).then(function(user) {
        equal(user.id, bob.get('id'));
        equal(user.get('name'), bob.get('name'));
        // makes the user after getting query response
        equal(FactoryGuy.store.peekAll('user').get('content').length, 1);
        done();
      });
    });
  });

  test("using returns with model instance returns that model, and does not create new one", function(assert) {
    Ember.run(()=> {
      let done = assert.async();

      let bob = make('user');
      mockQueryRecord('user', { name: 'Bob' }).returns({ model: bob });

      FactoryGuy.store.queryRecord('user', { name: 'Bob' }).then(function(user) {
        equal(user, bob, "returns the same user");
        equal(FactoryGuy.store.peekAll('user').get('content').length, 1, "does not create a new model");
        done();
      });
    });
  });

  test("using returns with model id returns that model, and does not create new one", function(assert) {
    Ember.run(()=> {
      let done = assert.async();

      let bob = make('user');
      mockQueryRecord('user', { name: 'Bob' }).returns({ id: bob.id });

      FactoryGuy.store.queryRecord('user', { name: 'Bob' }).then(function(user) {
        equal(user, bob, "returns the same user");
        equal(FactoryGuy.store.peekAll('user').get('content').length, 1, "does not create a new model");
        done();
      });
    });
  });

  test("twice using returns with differnet json and different params returns different results", function(assert) {
    Ember.run(()=> {
      let done = assert.async();

      let company1 = build('company');
      mockQueryRecord('company', { name: 'Dude' }).returns({ json: company1 });

      let company2 = build('company');
      mockQueryRecord('company', { type: 'Small' }).returns({ json: company2 });

      FactoryGuy.store.queryRecord('company', { name: 'Dude' }).then(function(company) {
        equal(company.get('id'), company1.get('id'));

        FactoryGuy.store.queryRecord('company', { type: 'Small' }).then(function(company) {
          equal(company.get('id'), company2.get('id'));
          done();
        });
      });
    });
  });

  test("reusing mock using returns with differnt json and withParams with different params returns different results", function(assert) {
    Ember.run(()=> {
      let done = assert.async();

      let company1 = build('company');
      let company2 = build('company');

      let mockQuery = mockQueryRecord('company', { name: 'Dude' }).returns({ json: company1 });
      FactoryGuy.store.queryRecord('company', { name: 'Dude' }).then(function(company) {
        equal(company.get('id'), company1.get('id'));

        mockQuery.withParams({ type: 'Small' }).returns({ json: company2 });
        FactoryGuy.store.queryRecord('company', { type: 'Small' }).then(function(company) {
          equal(company.get('id'), company2.get('id'));
          done();
        });
      });
    });
  });

};

/////// mockCreate //////////

SharedBehavior.mockCreateTests = function() {

  test("the basic", function(assert) {
    Ember.run(()=> {
      let done = assert.async();
      let customDescription = "special description";

      mockCreate('profile', {
        match: { description: customDescription }
      });
      ok(FactoryGuy.store.peekAll('profile').get('content.length') === 0);
      FactoryGuy.store.createRecord('profile', {
        description: customDescription
      }).save().then(function(profile) {
        ok(FactoryGuy.store.peekAll('profile').get('content.length') === 1, 'No extra records created');
        ok(profile instanceof Profile, 'Creates the correct type of record');
        ok(profile.get('description') === customDescription, 'Passes along the match attributes');
        done();
      });
    });
  });

  test("with dasherized model name", function(assert) {
    Ember.run(()=> {
      let done = assert.async();
      let customName = "special name";

      mockCreate('super-hero', {
        match: { name: customName }
      });
      ok(FactoryGuy.store.peekAll('super-hero').get('content.length') === 0);
      FactoryGuy.store.createRecord('super-hero', {
        name: customName
      }).save().then(function(superHero) {
        ok(FactoryGuy.store.peekAll('super-hero').get('content.length') === 1, 'No extra records created');
        ok(superHero instanceof SuperHero, 'Creates the correct type of record');
        ok(superHero.get('name') === customName, 'Passes along the match attributes');
        done();
      });
    });
  });

  /////// with hash of parameters ///////////////////
  //  test("with no specific match", function(assert) {
  //    Ember.run(()=> {
  //      let done = assert.async();
  //      mockCreate('profile');
  //
  //      FactoryGuy.store.createRecord('profile', { description: 'whatever' }).save().then(function(profile) {
  //        ok(profile.id === "1");
  //        ok(profile.get('description') === 'whatever');
  //        done();
  //      });
  //
  //    });
  //  });
  //
  //  test("with no specific match creates many in a loop", function(assert) {
  //    Ember.run(()=> {
  //      let done = assert.async();
  //
  //      mockCreate('profile');
  //
  //      let promises = [1, 2, 3].map(function() {
  //        return FactoryGuy.store.createRecord('profile', { description: 'whatever' }).save();
  //      });
  //
  //      Ember.RSVP.all(promises).then(function(profiles) {
  //        let ids = profiles.map(function(profile) {
  //          return profile.get('id');
  //        });
  //        let descriptions = profiles.map(function(profile) {
  //          return profile.get('description');
  //        });
  //        ok(ids + '' === [1, 2, 3] + '');
  //        ok(descriptions + '' === ['whatever', 'whatever', 'whatever'] + '');
  //        done();
  //      });
  //    });
  //  });
  //
  //  test("match some attributes", function(assert) {
  //    Ember.run(()=> {
  //      let done = assert.async();
  //      let customDescription = "special description";
  //      let date = new Date();
  //
  //      mockCreate('profile', { match: { description: customDescription } });
  //
  //      FactoryGuy.store.createRecord('profile', {
  //        description: customDescription, created_at: date
  //      }).save().then(function(profile) {
  //        ok(profile instanceof Profile);
  //        ok(profile.id === '1');
  //        ok(profile.get('description') === customDescription);
  //        done();
  //      });
  //    });
  //  });
  //
  //  test("match all attributes", function(assert) {
  //    Ember.run(()=> {
  //      let done = assert.async();
  //      let customDescription = "special description";
  //      let date = new Date();
  //
  //      mockCreate('profile', {
  //        match: { description: customDescription, created_at: date }
  //      });
  //
  //      FactoryGuy.store.createRecord('profile', {
  //        description: customDescription, created_at: date
  //      }).save().then(function(profile) {
  //        ok(profile instanceof Profile);
  //        ok(profile.id === '1');
  //        ok(profile.get('description') === customDescription);
  //        ok(profile.get('created_at').toString() === date.toString());
  //        done();
  //      });
  //    });
  //  });
  //
  //
  //  test("returns attributes", function(assert) {
  //    Ember.run(()=> {
  //      let done = assert.async();
  //      let date = new Date();
  //
  //      mockCreate('profile', {
  //        returns: { created_at: date, description: 'mano' }
  //      });
  //
  //      FactoryGuy.store.createRecord('profile').save().then(function(profile) {
  //        ok(profile.get("created_at") + '' === date + '');
  //        done();
  //      });
  //    });
  //  });
  //
  //  test("match belongsTo association", function(assert) {
  //    Ember.run(()=> {
  //      let done = assert.async();
  //      let company = make('company');
  //      mockCreate('profile', { match: { company: company } });
  //
  //      FactoryGuy.store.createRecord('profile', { company: company }).save().then(function(profile) {
  //        ok(profile.get('company') === company);
  //        done();
  //      });
  //    });
  //  });
  //
  //  test("match belongsTo polymorphic association", function(assert) {
  //    Ember.run(()=> {
  //      let done = assert.async();
  //      let group = make('group');
  //      mockCreate('profile', { match: { group: group } });
  //
  //      FactoryGuy.store.createRecord('profile', { group: group }).save().then(function(profile) {
  //        ok(profile.get('group') === group);
  //        done();
  //      });
  //    });
  //  });
  //
  //
  //  test("match attributes and return attributes", function(assert) {
  //    Ember.run(()=> {
  //      let done = assert.async();
  //      let date = new Date();
  //      let customDescription = "special description";
  //      let company = make('company');
  //      let group = make('big-group');
  //
  //      mockCreate('profile', {
  //        match: { description: customDescription, company: company, group: group },
  //        returns: { created_at: new Date() }
  //      });
  //
  //      FactoryGuy.store.createRecord('profile', {
  //        description: customDescription, company: company, group: group
  //      }).save().then(function(profile) {
  //        ok(profile.get('created_at').toString() === date.toString());
  //        ok(profile.get('group') === group);
  //        ok(profile.get('company') === company);
  //        ok(profile.get('description') === customDescription);
  //        done();
  //      });
  //    });
  //  });
  //
  //
  //  test("failure", function(assert) {
  //    Ember.run(()=> {
  //      let done = assert.async();
  //      mockCreate('profile').fails();
  //
  //      FactoryGuy.store.createRecord('profile').save()
  //        .catch(()=> {
  //          ok(true);
  //          done();
  //        });
  //    });
  //  });
  //
  //  test("failure with status code 422 and errors in response", function(assert) {
  //    Ember.run(()=> {
  //      let done = assert.async();
  //
  //      let errors = { errors: { description: ['bad'] } };
  //      mockCreate('profile').fails({ status: 422, response: errors });
  //
  //      let profile = FactoryGuy.store.createRecord('profile');
  //      profile.save()
  //        .catch(()=> {
  //          //let errors = invalidError.errors[0];
  //          //console.log('A',invalidError.errors);
  //          //console.log('B',profile.get('errors.messages'));
  //          //let errors = profile.get('errors.messages')[0];
  //          //equal(errors.title, 'invalid description');
  //          //equal(errors.detail, 'bad');
  //          ok(true);
  //          done();
  //        });
  //    });
  //  });
  //
  //
  //  test("match but still fail", function(assert) {
  //    Ember.run(()=> {
  //      let done = assert.async();
  //      let description = "special description";
  //
  //      mockCreate('profile', {
  //        match: { description: description }
  //      }).fails();
  //
  //      FactoryGuy.store.createRecord('profile', { description: description }).save()
  //        .catch(()=> {
  //          ok(true);
  //          done();
  //        });
  //    });
  //  });
  //
  //  test("fails when match args not present in createRecord attributes", function(assert) {
  //    Ember.run(()=> {
  //      let done = assert.async();
  //
  //      mockCreate('profile', { match: { description: 'correct description' } });
  //
  //      FactoryGuy.store.createRecord('profile', { description: 'wrong description' }).save()
  //        .catch(()=> {
  //          ok(true);
  //          done();
  //        });
  //    });
  //  });
  //

  test("with no specific match", function(assert) {
    Ember.run(()=> {
      let done = assert.async();

      mockCreate('profile');

      FactoryGuy.store.createRecord('profile', { description: 'whatever' })
        .save().then((profile)=> {
        ok(profile.id === "1");
        ok(profile.get('description') === 'whatever');
        done();
      });
    });
  });

  test("with no specific match creates many in a loop", function(assert) {
    Ember.run(()=> {
      let done = assert.async();

      mockCreate('profile');

      let promises = [1, 2, 3].map(function() {
        return FactoryGuy.store.createRecord('profile', { description: 'whatever' }).save();
      });

      Ember.RSVP.all(promises).then(function(profiles) {
        let ids = profiles.map(function(profile) {
          return profile.get('id');
        });
        let descriptions = profiles.map(function(profile) {
          return profile.get('description');
        });
        deepEqual(ids, ['1', '2', '3']);
        deepEqual(descriptions, ['whatever', 'whatever', 'whatever']);
        done();
      });
    });
  });

  test("match some attributes", function(assert) {
    Ember.run(()=> {
      let done = assert.async();
      let customDescription = "special description";
      let date = new Date();

      mockCreate('profile').match({ description: customDescription });

      FactoryGuy.store.createRecord('profile', {
        description: customDescription, created_at: date
      }).save().then(function(profile) {
        ok(profile instanceof Profile);
        ok(profile.id === '1');
        ok(profile.get('description') === customDescription);
        done();
      });
    });
  });

  test("match all attributes", function(assert) {
    Ember.run(()=> {
      let done = assert.async();
      let customDescription = "special description";
      let date = new Date();

      mockCreate('profile').match({ description: customDescription, created_at: date });

      FactoryGuy.store.createRecord('profile', {
        description: customDescription, created_at: date
      }).save().then(function(profile) {
        ok(profile instanceof Profile);
        ok(profile.id === '1');
        ok(profile.get('description') === customDescription);
        ok(profile.get('created_at').toString() === date.toString());
        done();
      });
    });
  });

  test("match belongsTo association", function(assert) {
    Ember.run(()=> {
      let done = assert.async();
      let company = make('company');

      mockCreate('profile').match({ company: company });

      FactoryGuy.store.createRecord('profile', { company: company }).save().then(function(profile) {
        ok(profile.get('company') === company);
        done();
      });
    });
  });

  test("match belongsTo polymorphic association", function(assert) {
    Ember.run(()=> {
      let done = assert.async();
      let group = make('group');
      mockCreate('profile').match({ group: group });

      FactoryGuy.store.createRecord('profile', { group: group }).save().then(function(profile) {
        ok(profile.get('group') === group);
        done();
      });
    });
  });


  test("using returns method with attributes", function(assert) {
    Ember.run(()=> {
      let done = assert.async();
      let date = new Date();

      mockCreate('profile').returns({ created_at: date });

      FactoryGuy.store.createRecord('profile').save().then(function(profile) {
        ok(profile.get('created_at').toString() === date.toString());
        done();
      });
    });
  });


  test("using returns method with user-supplied model id", function(assert) {
    Ember.run(()=> {
      let done = assert.async();
      let id = 42;

      mockCreate('profile').returns({ id: id });

      FactoryGuy.store.createRecord('profile').save().then(function(profile) {
        assert.equal(profile.get('id'), id);
        done();
      });
    });
  });


  test("match attributes and also return attributes", function(assert) {
    Ember.run(()=> {
      let done = assert.async();
      let date = new Date(2015, 1, 2, 3, 4, 5);
      let customDescription = "special description";
      let company = make('company');
      let group = make('big-group');

      mockCreate('profile')
        .match({ description: customDescription, company: company, group: group })
        .returns({ created_at: date });

      FactoryGuy.store.createRecord('profile', {
        description: customDescription, company: company, group: group
      }).save().then(function(profile) {
        ok(profile.get('created_at').toString() === date.toString());
        ok(profile.get('group') === group);
        ok(profile.get('company') === company);
        ok(profile.get('description') === customDescription);
        done();
      });
    });
  });


  test("failure with fails method", function(assert) {
    Ember.run(()=> {
      let done = assert.async();

      let mock = mockCreate('profile').fails();

      FactoryGuy.store.createRecord('profile').save()
        .catch(()=> {
          ok(true);
          equal(mock.timesCalled, 1);
          done();
        });
    });
  });

  test("fails when match args not present in createRecord attributes", function(assert) {
    Ember.run(()=> {
      let done = assert.async();

      let mock = mockCreate('profile').match({ description: 'correct description' });

      FactoryGuy.store.createRecord('profile', { description: 'wrong description' }).save()
        .catch(()=> {
          ok(true);
          equal(mock.timesCalled, 0);
          done();
        });
    });
  });

  test("match but still fail with fails method", function(assert) {
    Ember.run(()=> {
      let done = assert.async();
      let description = "special description";

      let mock = mockCreate('profile').match({ description: description }).fails();

      FactoryGuy.store.createRecord('profile', { description: description }).save()
        .catch(()=> {
          ok(true);
          equal(mock.timesCalled, 1);
          done();
        });
    });
  });

  test("failure with status code 422 and errors in response with fails method", function(assert) {
    Ember.run(()=> {
      let done = assert.async();

      let errors = { errors: { description: ['bad'] } };
      let mock = mockCreate('profile').fails({ status: 422, response: errors });

      let profile = FactoryGuy.store.createRecord('profile');
      profile.save()
        .catch((reason)=> {
//          console.log('A reason', reason.errors);
//          console.log('AA reason', reason.errors[0] && reason.errors[0].detail, reason.errors[0].title);
//          let errors = reason.errors[0];
//          equal(errors.detail,'bad');
          // TODO .. almost have this one =>  profile.get('errors.messages');
          // it should === 'bad' only DRFAdapter failing
//          let descriptionError = profile.get('errors.messages');
//          equal(descriptionError, 'bad');
          equal(mock.timesCalled, 1);
          ok(true);
          done();
        });
    });
  });

};


SharedBehavior.mockCreateReturnsAssociations = function(App, adapter, serializerType) {

  module(title(adapter, '#mockCreate | returns association'), inlineSetup(App, serializerType));

  test("belongsTo", function(assert) {
    Ember.run(()=> {
      let done = assert.async();
      let company = build('company');
      mockCreate('profile').returns({ company });

      FactoryGuy.store.createRecord('profile').save().then(function(profile) {
        equal(profile.get('company.id'), company.get('id').toString());
        equal(profile.get('company.name'), company.get('name'));
        done();
      });
    });
  });

  test("belongsTo ( polymorphic )", function(assert) {
    Ember.run(()=> {
      let done = assert.async();
      let person = build('super-hero');
      mockCreate('outfit').returns({ person });

      FactoryGuy.store.createRecord('outfit').save().then(function(outfit) {
        equal(outfit.get('person.id'), person.get('id').toString());
        equal(outfit.get('person.name'), person.get('name'));
        done();
      });
    });
  });

  test("hasMany", function(assert) {
    Ember.run(()=> {
      let done = assert.async();
      let outfits = buildList('outfit', 2);
      mockCreate('super-hero').returns({ outfits });

      FactoryGuy.store.createRecord('super-hero').save().then(function(hero) {
        deepEqual(hero.get('outfits').mapBy('id'), ['1', '2']);
        deepEqual(hero.get('outfits').mapBy('name'), ['Outfit-1', 'Outfit-2']);
        done();
      });
    });
  });

};

SharedBehavior.mockCreateReturnsEmbeddedAssociations = function(App, adapter, serializerType) {

  module(title(adapter, '#mockCreate | returns embedded association'), inlineSetup(App, serializerType));

  test("belongsTo", function(assert) {
    Ember.run(()=> {
      let done = assert.async();
      let company = build('company');
      mockCreate('comic-book').returns({ company });

      FactoryGuy.store.createRecord('comic-book').save().then(function(comic) {
        equal(comic.get('company.id'), company.get('id').toString());
        equal(comic.get('company.name'), company.get('name').toString());
        done();
      });
    });
  });

};

/////// mockUpdate //////////

SharedBehavior.mockUpdateTests = function() {

  test("with modelType and id", function(assert) {
    Ember.run(()=> {
      let done = assert.async();
      let profile = make('profile');
      mockUpdate('profile', profile.id);

      profile.set('description', 'new desc');
      profile.save().then(function(profile) {
        ok(profile.get('description') === 'new desc');
        done();
      });
    });
  });


  test("with model", function(assert) {
    Ember.run(()=> {
      let done = assert.async();
      let profile = make('profile');
      mockUpdate(profile);

      profile.set('description', 'new desc');
      profile.save().then(function(profile) {
        ok(profile.get('description') === 'new desc');
        done();
      });
    });
  });

  test("with model that has polymorphic belongsTo", function(assert) {
    Ember.run(()=> {
      let done = assert.async();

      let group = make('group');
      let profile = make('profile', { group: group });
      mockUpdate(profile);

      profile.set('description', 'new desc');
      profile.save().then(function(profile) {
        ok(profile.get('description') === 'new desc');
        done();
      });
    });
  });


  test('with model that has model fragment as the updated field', function(assert) {
    Ember.run(() => {
      let done = assert.async();
      let employee = make('employee');

      mockUpdate(employee);

      ok(!employee.get('hasDirtyAttributes'));
      employee.set('name.firstName', 'Jamie');

      ok(employee.get('name.firstName') === 'Jamie');
      ok(employee.get('name.lastName') === 'Lannister');

      ok(employee.get('hasDirtyAttributes'));

      employee.save().then(()=> {
        ok(!employee.get('hasDirtyAttributes'));
        done();
      });
    });
  });

  test("with modelType and id that fails", function(assert) {
    Ember.run(()=> {
      let done = assert.async();
      let profile = make('profile');

      mockUpdate('profile', profile.id).fails({ status: 500 });

      profile.set('description', 'new desc');
      profile.save().catch(
        function(reason) {
          let error = reason.errors[0];
          equal(error.status, "500");
          done();
        }
      );
    });
  });


  test("with model that fails with custom status", function(assert) {
    let done = assert.async();
    Ember.run(()=> {
      let profile = make('profile');

      mockUpdate(profile).fails({ status: 401 });

      profile.set('description', 'new desc');
      profile.save().catch(
        function(reason) {
          let error = reason.errors[0];
          equal(error.status, "401");
          done();
        }
      );
    });
  });


  test("with model that fails and then succeeds", function(assert) {
    Ember.run(()=> {
      let done = assert.async();
      let profile = make('profile');

      let updateMock = mockUpdate(profile).fails();

      profile.set('description', 'new desc');
      profile.save()
        .catch(()=> ok(true, 'update failed the first time'))
        .then(()=> {
          updateMock.succeeds();
          ok(!profile.get('valid'), "Profile is invalid.");

          profile.save().then(() => {
              ok(!profile.get('saving'), "Saved model");
              ok(profile.get('description') === 'new desc', "Description was updated.");
              done();
            }
          );
        });
    });
  });
};

SharedBehavior.mockUpdateWithErrorMessages = function(App, adapter, serializerType) {

  module(title(adapter, '#mockUpdate | error messages'), inlineSetup(App, serializerType));

  test("with model returns custom response", function(assert) {
    Ember.run(()=> {
      let done = assert.async();
      let profile = make('profile');

      mockUpdate(profile).fails({
        status: 400,
        response: { errors: { description: 'invalid data' } }
      });

      profile.set('description', 'new desc');
      profile.save().catch(
        function(reason) {
          let errors = reason.errors;
          equal(errors.description, "invalid data", "custom description shows up in errors");
          done();
        }
      );
    });
  });
};


SharedBehavior.mockUpdateReturnsAssociations = function(App, adapter, serializerType) {

  module(title(adapter, '#mockUpdate | returns association'), inlineSetup(App, serializerType));

  test("belongsTo", function(assert) {
    Ember.run(()=> {
      let done = assert.async();
      
      let profile = make('profile');
      profile.set('description', 'new desc');
      
      let company = build('company');
      mockUpdate(profile).returns({ company });
      
      profile.save().then(function(profile) {
        equal(profile.get('company.id'), company.get('id').toString());
        equal(profile.get('company.name'), company.get('name'));
        done();
      });
    });
  });

  test("belongsTo ( polymorphic )", function(assert) {
    Ember.run(()=> {
      let done = assert.async();

      let newValue = 'new name';
      let outfit = make('outfit');
      outfit.set('name', newValue);
      
      let person = build('super-hero');
      mockUpdate(outfit).returns({ person });

      outfit.save().then(function(outfit) {
        equal(outfit.get('name'), newValue);
        equal(outfit.get('person.id'), person.get('id').toString());
        equal(outfit.get('person.name'), person.get('name'));
        done();
      });
    });
  });

  test("hasMany", function(assert) {
    Ember.run(()=> {
      let done = assert.async();

      let newValue = 'BoringMan';
      let superHero = make('bat_man');
      superHero.set('name', newValue);
      
      let outfits = buildList('outfit', 2);
      mockUpdate(superHero).returns({ outfits });

      superHero.save().then(function(hero) {
        equal(hero.get('name'), newValue);
        deepEqual(hero.get('outfits').mapBy('id'), ['1', '2']);
        deepEqual(hero.get('outfits').mapBy('name'), ['Outfit-1', 'Outfit-2']);
        done();
      });
    });
  });

};

SharedBehavior.mockUpdateReturnsEmbeddedAssociations = function(App, adapter, serializerType) {

  module(title(adapter, '#mockUpdate | returns embedded association'), inlineSetup(App, serializerType));

  test("belongsTo", function(assert) {
    Ember.run(()=> {
      let done = assert.async();
      let newValue = 'new name';
      let comicBook = make('comic-book', {characters: []});
      comicBook.set('name', newValue);
      
      let company = build('company');
      mockUpdate(comicBook).returns({ company });

      comicBook.save().then(function(comic) {
        equal(comic.get('name'), newValue);
        equal(comic.get('company.id'), company.get('id').toString());
        equal(comic.get('company.name'), company.get('name').toString());
        done();
      });
    });
  });

};

/////// mockDelete //////////

SharedBehavior.mockDeleteTests = function() {
  test("with modelType", function(assert) {
    Ember.run(()=> {
      let done = assert.async();
      let profiles = makeList('profile', 2);
      let profile = profiles[0];
      mockDelete('profile');

      equal(FactoryGuy.store.peekAll('profile').get('content.length'), 2);

      profile.destroyRecord().then(function() {
        equal(FactoryGuy.store.peekAll('profile').get('content.length'), 1);
        done();
      });
    });
  });

  test("with modelType and id", function(assert) {
    Ember.run(()=> {
      let done = assert.async();
      let profile = make('profile');
      mockDelete('profile', profile.id);

      profile.destroyRecord().then(function() {
        equal(FactoryGuy.store.peekAll('profile').get('content.length'), 0);
        done();
      });
    });
  });

  test("with model", function(assert) {
    Ember.run(()=> {
      let done = assert.async();
      let profile = make('profile');
      mockDelete(profile);

      profile.destroyRecord().then(function() {
        equal(FactoryGuy.store.peekAll('profile').get('content.length'), 0);
        done();
      });
    });
  });

  test("with modelType that fails", function(assert) {
    Ember.run(()=> {
      let done = assert.async();
      let profiles = makeList('profile', 2);
      let profile = profiles[0];
      let mock = mockDelete('profile').fails({ status: 500 });

      profile.destroyRecord().catch(function(reason) {
        let error = reason.errors[0];
        equal(error.status, "500");
        equal(mock.timesCalled, 1);
        ok(true);
        done();
      });
    });
  });

  test("with modelType and id that fails", function(assert) {
    Ember.run(()=> {
      let done = assert.async();
      let profile = make('profile');
      let mock = mockDelete('profile', profile.id).fails({ status: 500 });

      profile.destroyRecord().catch(function(reason) {
        let error = reason.errors[0];
        equal(error.status, "500");
        equal(mock.timesCalled, 1);
        ok(true);
        done();
      });
    });
  });

  test("with model that fails with custom status", function(assert) {
    let done = assert.async();
    Ember.run(()=> {
      let profile = make('profile');

      mockDelete(profile).fails({ status: 401 });

      profile.destroyRecord().catch(
        function(reason) {
          let error = reason.errors[0];
          equal(error.status, "401");
          done();
        }
      );
    });
  });

  test("with modelType that fails and then succeeds", function(assert) {
    Ember.run(()=> {
      let done = assert.async();
      let profiles = makeList('profile', 2);
      let profile = profiles[0];
      let deleteMock = mockDelete('profile').fails();

      profile.destroyRecord()
        .catch(()=> ok(true, 'delete failed the first time'))
        .then(()=> {
          deleteMock.succeeds();

          profile.destroyRecord().then(function() {
            equal(FactoryGuy.store.peekAll('profile').get('content.length'), 1);
            done();
          });
        });
    });
  });

  test("with modelType and id that fails and then succeeds", function(assert) {
    Ember.run(()=> {
      let done = assert.async();
      let profile = make('profile');

      let deleteMock = mockDelete('profile', profile.id).fails();

      profile.destroyRecord()
        .catch(()=> ok(true, 'delete failed the first time'))
        .then(()=> {
          deleteMock.succeeds();

          profile.destroyRecord().then(function() {
            equal(FactoryGuy.store.peekAll('profile').get('content.length'), 0);
            done();
          });
        });
    });
  });

  test("with model that fails and then succeeds", function(assert) {
    Ember.run(()=> {
      let done = assert.async();
      let profile = make('profile');

      let deleteMock = mockDelete(profile).fails();

      profile.destroyRecord()
        .catch(()=> ok(true, 'delete failed the first time'))
        .then(()=> {
          deleteMock.succeeds();

          profile.destroyRecord().then(function() {
            equal(FactoryGuy.store.peekAll('profile').get('content.length'), 0);
            done();
          });
        });
    });
  });
};

export default SharedBehavior;
