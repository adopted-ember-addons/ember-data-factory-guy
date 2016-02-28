import Ember from 'ember';
import FactoryGuy, { make, makeList } from 'ember-data-factory-guy';
import TestHelper from 'ember-data-factory-guy/factory-guy-test-helper';
import {
  mockSetup, mockTeardown,
  mockFind, mockFindAll, mockReload, mockQuery,
  mockQueryRecord, mockCreate, mockUpdate, mockDelete
 } from 'ember-data-factory-guy';
import MissingSequenceError from 'ember-data-factory-guy/missing-sequence-error';
import $ from 'jquery';

import Profile from 'dummy/models/profile';

let SharedBehavior = {};

//////// buildUrl /////////
SharedBehavior.buildUrl = function() {

  test("#buildURL without namespace", function() {
    equal(FactoryGuy.buildURL('project'), '/projects', 'has no namespace by default');
  });

  test("#buildURL with namespace and host", function() {
    let adapter = FactoryGuy.get('store').adapterFor('application');
    adapter.setProperties({
      host: 'https://dude.com',
      namespace: 'api/v1'
    });

    equal(FactoryGuy.buildURL('project'), 'https://dude.com/api/v1/projects');
  });

};

//////// mockFind /////////
SharedBehavior.handleFindTests = function() {

  test("have access to handler being used by mockjack", function() {
    let mock = mockFind('user');
    ok(mock.handler);
  });

  test("the basic returns id", function(assert) {
    Ember.run(function() {
      let done = assert.async();
      let profile = mockFind('profile');
      let profileId = profile.get('id');

      FactoryGuy.get('store').find('profile', profileId).then(function(profile) {
        equal(profile.get('id'), profileId);
        equal(profile.get('description'), 'Text goes here');
        done();
      });
    });
  });

  test("with fixture options", function(assert) {
    Ember.run(function() {
      let done = assert.async();
      let profile = mockFind('profile', { description: 'dude' });
      let profileId = profile.get('id');

      FactoryGuy.get('store').find('profile', profileId).then(function(profile) {
        ok(profile.get('description') === 'dude');
        done();
      });
    });
  });

  test("handles differently cased attributes", function(assert) {
    Ember.run(function() {
      let done = assert.async();

      let profile = mockFind('profile');
      let profileId = profile.get('id');

      FactoryGuy.get('store').find('profile', profileId).then(function(profile) {
        ok(profile.get('camelCaseDescription') === 'textGoesHere');
        ok(profile.get('snake_case_description') === 'text_goes_here');
        done();
      });
    });
  });

  test("with traits", function(assert) {
    Ember.run(function() {
      let done = assert.async();

      let profile = mockFind('profile', 'goofy_description');
      let profileId = profile.get('id');

      FactoryGuy.get('store').find('profile', profileId).then(function(profile) {
        ok(profile.get('description') === 'goofy');
        done();
      });
    });
  });

  test("with traits and extra options", function(assert) {
    Ember.run(function() {
      let done = assert.async();

      let profile = mockFind('profile', 'goofy_description', { description: 'dude' });
      let profileId = profile.get('id');

      FactoryGuy.get('store').find('profile', profileId).then(function(profile) {
        ok(profile.get('description') === 'dude');
        done();
      });
    });
  });


  test("with belongsTo association", function(assert) {
    Ember.run(function() {
      let done = assert.async();
      let profile = mockFind('profile', 'with_company', 'with_bat_man');
      let profileId = profile.get('id');

      FactoryGuy.get('store').find('profile', profileId).then(function(profile) {
        ok(profile.get('company.name') === 'Silly corp');
        ok(profile.get('superHero.name') === 'BatMan');
        done();
      });
    });
  });


  test("with hasMany association", function(assert) {
    Ember.run(function() {
      let done = assert.async();
      let user = mockFind('user', 'with_hats');
      let userId = user.get('id');

      FactoryGuy.get('store').find('user', userId).then(function(user) {
        ok(user.get('hats.length') === 2);
        ok(user.get('hats.firstObject.type') === 'BigHat');
        done();
      });
    });
  });

  test("using returns with json", function(assert) {
    Ember.run(function() {
      let done = assert.async();

      let json = FactoryGuy.build('profile', 'with_company', 'with_bat_man');
      let profile = mockFind('profile').returns({json});
      let profileId = profile.get('id');

      FactoryGuy.get('store').find('profile', profileId).then(function(profile) {
        ok(profile.get('company.name') === 'Silly corp');
        ok(profile.get('superHero.name') === 'BatMan');
        done();
      });
    });
  });

  test("using returns with model", function(assert) {
    Ember.run(function() {
      let done = assert.async();

      let model = make('profile', 'with_company', 'with_bat_man');
      let profile = mockFind('profile').returns({model});
      let profileId = profile.get('id');

      FactoryGuy.get('store').find('profile', profileId).then(function(profile) {
        ok(profile.get('company.name') === 'Silly corp');
        ok(profile.get('superHero.name') === 'BatMan');
        equal(FactoryGuy.get('store').peekAll('profile').get('content').length, 1, "does not make another profile");
        done();
      });
    });
  });
};

//////// mockReload /////////

SharedBehavior.handleReloadTests = function() {

  test("with a record handles reload, and does not change attributes", function(assert) {
    let done = assert.async();
    Ember.run(function() {
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
    Ember.run(function() {
      let profile = make('profile', { description: "whatever", camelCaseDescription: "noodles" });

      mockReload(profile).returns({attrs: {description: "moo"}});

      profile.reload().then(function(reloaded) {
        ok(reloaded.id === profile.id);
        ok(reloaded.get('description') === "moo", "attribute changed");
        ok(reloaded.get('camelCaseDescription') === "noodles", "other attributes are same");
        done();
      });
    });
  });

  test("failure with fails method", function(assert) {
    Ember.run(function() {
      let done = assert.async();
      mockReload('profile', 1).fails();

      FactoryGuy.get('store').find('profile', 1).then(
        function() {
        },
        function() {
          ok(true);
          done();
        }
      );
    });
  });

};

/////// mockFindAll //////////

SharedBehavior.handleFindAllTests = function() {

  test("have access to handler being used by mockjack", function() {
    let mock = mockFindAll('user');
    ok(mock.handler);
  });

  test("the basic", function(assert) {
    Ember.run(function() {
      let done = assert.async();
      mockFindAll('user', 2);

      FactoryGuy.get('store').findAll('user').then(function(users) {
        ok(users.get('length') === 2);
        done();
      });
    });
  });

  test("handles differently cased attributes", function(assert) {
    Ember.run(function() {
      let done = assert.async();

      mockFindAll('profile', 1);

      FactoryGuy.get('store').findAll('profile').then(function(profiles) {
        ok(profiles.get('firstObject.camelCaseDescription') === 'textGoesHere');
        ok(profiles.get('firstObject.snake_case_description') === 'text_goes_here');
        done();
      });
    });
  });

  test("asking for no return records", function(assert) {
    Ember.run(function() {
      let done = assert.async();
      mockFindAll('user', 0);

      FactoryGuy.get('store').findAll('user').then(function(profiles) {
        ok(profiles.get('length') === 0);
        done();
      });
    });
  });

  test("with fixture options", function(assert) {
    Ember.run(function() {
      let done = assert.async();
      mockFindAll('profile', 2, { description: 'dude' });

      FactoryGuy.get('store').findAll('profile').then(function(profiles) {
        ok(profiles.get('length') === 2);
        ok(profiles.get('firstObject.description') === 'dude');
        done();
      });
    });
  });

  test("with traits", function(assert) {
    let done = assert.async();
    mockFindAll('profile', 2, 'goofy_description');

    FactoryGuy.get('store').findAll('profile').then(function(profiles) {
      ok(profiles.get('length') === 2);
      ok(profiles.get('firstObject.description') === 'goofy');
      done();
    });
  });

  test("with traits and extra options", function(assert) {
    let done = assert.async();
    mockFindAll('profile', 2, 'goofy_description', { description: 'dude' });

    FactoryGuy.get('store').findAll('profile').then(function(profiles) {
      ok(profiles.get('length') === 2);
      ok(profiles.get('firstObject.description') === 'dude');
      done();
    });
  });


  test("with belongsTo association", function(assert) {
    Ember.run(function() {
      let done = assert.async();
      mockFindAll('profile', 2, 'with_company', 'with_bat_man');

      FactoryGuy.get('store').findAll('profile').then(function(profiles) {
        ok(profiles.get('length') === 2);
        ok(profiles.get('firstObject.company.name') === 'Silly corp');
        ok(profiles.get('lastObject.superHero.name') === 'BatMan');
        done();
      });
    });
  });


  test("with hasMany association", function(assert) {
    Ember.run(function() {
      let done = assert.async();

      mockFindAll('user', 2, 'with_hats');

      FactoryGuy.get('store').findAll('user').then(function(users) {
        ok(users.get('length') === 2);
        ok(users.get('lastObject.hats').mapBy('type') + '' === ['BigHat', 'BigHat'] + '');
        ok(users.get('lastObject.hats').mapBy('id') + '' === [3, 4] + '');
        done();
      });
    });
  });

  test("with diverse models", function(assert) {
    Ember.run(function() {
      let done = assert.async();
      mockFindAll('profile', 'goofy_description', { description: 'foo' }, ['goofy_description', { aBooleanField: true }]);

      FactoryGuy.get('store').findAll('profile').then(function(profiles) {
        ok(profiles.get('length') === 3);
        ok(profiles.objectAt(0).get('description') === 'goofy');
        ok(profiles.objectAt(0).get('aBooleanField') === false);
        ok(profiles.objectAt(1).get('description') === 'foo');
        ok(profiles.objectAt(1).get('aBooleanField') === false);
        ok(profiles.objectAt(2).get('description') === 'goofy');
        ok(profiles.objectAt(2).get('aBooleanField') === true);
        done();
      });
    });
  });

  test("using returns with json", function(assert) {
    Ember.run(function() {
      let done = assert.async();

      let json = FactoryGuy.buildList('profile', 'with_company', 'with_bat_man');
      mockFindAll('profile').returns({json});

      FactoryGuy.get('store').findAll('profile').then(function(profiles) {
        ok(profiles.get('firstObject.company.name') === 'Silly corp');
        ok(profiles.get('lastObject.superHero.name') === 'BatMan');
        done();
      });
    });
  });

  test("using returns with model", function(assert) {
    Ember.run(function() {
      let done = assert.async();

      let models = makeList('profile', 'with_company', 'with_bat_man');
      mockFindAll('profile').returns({models});

      FactoryGuy.get('store').findAll('profile').then(function(profiles) {
        ok(profiles.get('firstObject.company.name') === 'Silly corp');
        ok(profiles.get('lastObject.superHero.name') === 'BatMan');
        equal(FactoryGuy.get('store').peekAll('profile').get('content').length, 2, "does not make new profiles");
        done();
      });
    });
  });

};


/////// mockQuery //////////

SharedBehavior.handleQueryTests = function() {

  test("json payload argument should be an object", function(assert) {
    assert.throws(function() {
      mockQuery('user', 'name', {});
    }, "query argument should not be a string");

    assert.throws(function() {
      mockQuery('user', ['name'], {});
    }, "query argument should not be an array");
  });

  test("mock query returns() accepts only ids, or models or json keys", function(assert) {
    const handler = mockQuery('user', { name: 'Bob' });
    // In those tests, values don't matter
    assert.throws(()=> {
      handler.returns({
        ids: undefined,
        models: undefined
      });
    });

    assert.throws(()=> {
      handler.returns({
        ids: undefined,
        json: undefined
      });
    });

    assert.throws(()=> {
      handler.returns({
        models: undefined,
        json: undefined
      });
    });

    assert.throws(()=> {
      handler.returns({
        ids: undefined,
        models: undefined,
        json: undefined
      });
    });
  });

  test("mock query using returns with an instance of DS.Model throws error", function(assert) {
    assert.throws(function() {
      let models = make('user', { name: 'Bob' });
      mockQuery('user', { name: 'Bob' }).returns({ models });
    }, "can't pass a DS.Model instance to mock query");
  });

  test("have access to handler being used by mockjack", function() {
    let mock = mockQuery('user');
    ok(mock.handler);
  });

  test("not using returns", function(assert) {
    Ember.run(function() {
      let done = assert.async();
      mockQuery('user', { name: 'Bob' });
      FactoryGuy.get('store').query('user', { name: 'Bob' }).then(function(users) {
        equal(users.get('length'), 0, "nothing returned");
        done();
      });
    });
  });

  test("using fails makes the request fail", function(assert) {
    Ember.run(function() {
      let done = assert.async();

      let errors = { errors: { name: ['wrong'] } };

      mockQuery('user').fails({ status: 422, response: errors });
      FactoryGuy.get('store').query('user',{}).catch(
        ()=> {
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

    FactoryGuy.get('store').query('company', queryParams);
  });

  test("using nested search params", function(assert) {
    Ember.run(function() {
      let done = assert.async();

      let models = makeList('company', 2);

      mockQuery('company', { name: { like: 'Dude*' } }).returns({ models });
      FactoryGuy.get('store').query('company', { name: { like: 'Dude*' } }).then(function(companies) {
        equal(companies.mapBy('id') + '', models.mapBy('id') + '');
        done();
      });
    });
  });

  test("using returns with empty array", function(assert) {
    Ember.run(function() {
      let done = assert.async();
      mockQuery('user', { name: 'Bob' }).returns({ models: [] });
      FactoryGuy.get('store').query('user', { name: 'Bob' }).then(function(users) {
        equal(users.get('length'), 0, "nothing returned");
        done();
      });
    });
  });

  test("using returns with model instances returns your models, and does not create new ones", function(assert) {
    Ember.run(function() {
      let done = assert.async();
      let bob = make('user');

      mockQuery('user', { name: 'Bob' }).returns({ models: [bob] });

      FactoryGuy.get('store').query('user', { name: 'Bob' }).then(function(users) {
        equal(users.get('length'), 1);
        equal(users.get('firstObject'), bob);
        equal(FactoryGuy.get('store').peekAll('user').get('content').length, 1, "does not make another user");
        done();
      });
    });
  });

  test("using returns with model instances having hasMany models", function(assert) {
    Ember.run(function() {
      let done = assert.async();

      let models = makeList('user', 2, 'with_hats');
      mockQuery('user', { name: 'Bob' }).returns({ models });

      equal(FactoryGuy.get('store').peekAll('user').get('content.length'), 2, 'start out with 2 instances');

      FactoryGuy.get('store').query('user', { name: 'Bob' }).then(function(users) {
        equal(users.get('length'), 2);
        equal(users.get('firstObject.name'), 'User1');
        equal(users.get('firstObject.hats.length'), 2);
        equal(users.get('lastObject.name'), 'User2');
        equal(FactoryGuy.get('store').peekAll('user').get('content.length'), 2, 'no new instances created');
        done();
      });
    });
  });

  test("using returns with model instances with hasMany and belongsTo relationships", function(assert) {
    Ember.run(function() {
      let done = assert.async();

      let models = makeList('company', 2, 'with_projects', 'with_profile');
      mockQuery('company', { name: 'Dude Company' }).returns({ models });

      equal(FactoryGuy.get('store').peekAll('company').get('content.length'), 2, 'start out with 2 instances');

      FactoryGuy.get('store').query('company', { name: 'Dude Company' }).then(function(companies) {
        equal(companies.get('length'), 2);
        ok(companies.get('firstObject.profile') instanceof Profile);
        equal(companies.get('firstObject.projects.length'), 2);
        ok(companies.get('lastObject.profile') instanceof Profile);
        equal(companies.get('lastObject.projects.length'), 2);
        equal(FactoryGuy.get('store').peekAll('company').get('content.length'), 2, 'no new instances created');
        done();
      });
    });
  });

  test("using returns with json returns and creates models", function(assert) {
    Ember.run(function() {
      let done = assert.async();

      let json = FactoryGuy.buildList('user', 1);
      mockQuery('user', { name: 'Bob' }).returns({ json });
      FactoryGuy.get('store').query('user', { name: 'Bob' }).then(function(users) {
        equal(users.get('length'), 1);
        // makes the user after getting query response
        equal(FactoryGuy.get('store').peekAll('user').get('content').length, 1);
        done();
      });
    });
  });

  test("using returns with model ids returns those models and does not create new ones", function(assert) {
    Ember.run(function() {
      let done = assert.async();

      let bob = make('user');
      let ids = [bob.id];
      mockQuery('user', { name: 'Bob' }).returns({ ids });

      FactoryGuy.get('store').query('user', { name: 'Bob' }).then(function(users) {
        equal(users.get('length'), 1);
        equal(users.get('firstObject'), bob);
        // does not create a new model
        equal(FactoryGuy.get('store').peekAll('user').get('content').length, 1);
        done();
      });
    });
  });

  // test created for issue #143
  test("reuse mock query to first return nothing then use returns to return something", function(assert) {
    Ember.run(function() {
      let done = assert.async();
      let store = FactoryGuy.get('store');

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
    Ember.run(function() {
      let done = assert.async();

      let companies1 = makeList('company', 2);
      mockQuery('company', { name: 'Dude' }).returns({ models: companies1 });

      let companies2 = makeList('company', 2);
      mockQuery('company', { type: 'Small' }).returns({ models: companies2 });

      FactoryGuy.get('store').query('company', { name: 'Dude' }).then(function(companies) {
        equal(companies.mapBy('id') + '', companies1.mapBy('id') + '');

        FactoryGuy.get('store').query('company', { type: 'Small' }).then(function(companies) {
          equal(companies.mapBy('id') + '', companies2.mapBy('id') + '');
          done();
        });
      });
    });
  });


  test("using returns with same json and different query params returns same results", function(assert) {
    Ember.run(function() {
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

      let request1 = FactoryGuy.get('store').query('company', { name: 'Dude' });
      let request2 = FactoryGuy.get('store').query('company', { type: 'Small', name: 'Dude' });

      request1.then(function(returnedCompanies) {
        equal(companies.mapBy('id') + '', returnedCompanies.mapBy('id') + '');
        finalizeTest();
      });

      request2.then(function(returnedCompanies) {
        equal(companies.mapBy('id') + '', returnedCompanies.mapBy('id') + '');
        finalizeTest();
      });
    });
  });

  test("reusing mock query using returns with differnt models and withParams with different params returns different results", function(assert) {
    Ember.run(function() {
      let done = assert.async();

      let companies1 = makeList('company', 2);
      let companies2 = makeList('company', 2);

      let queryHandler = mockQuery('company', { name: 'Dude' }).returns({ models: companies1 });
      FactoryGuy.get('store').query('company', { name: 'Dude' }).then(function(companies) {
        equal(companies.mapBy('id') + '', companies1.mapBy('id') + '');

        queryHandler.withParams({ type: 'Small' }).returns({ models: companies2 });
        FactoryGuy.get('store').query('company', { type: 'Small' }).then(function(companies) {
          equal(companies.mapBy('id') + '', companies2.mapBy('id') + '');
          done();
        });
      });
    });
  });


};

/////// mockQueryRecord //////////

SharedBehavior.handleQueryRecordTests = function() {

  test("returns() method accepts only id, model, json or header as keys", function(assert) {
    const handler = mockQueryRecord('user');

    assert.throws(()=> {
      handler.returns({
        ids: undefined,
      });
    });

    assert.throws(()=> {
      handler.returns({
        models: undefined,
      });
    });

    assert.throws(()=> {
      handler.returns({
        id: undefined,
        model: undefined
      });
    });

    assert.throws(()=> {
      handler.returns({
        id: undefined,
        json: undefined
      });
    });

    assert.throws(()=> {
      handler.returns({
        model: undefined,
        json: undefined
      });
    });

    assert.throws(()=> {
      handler.returns({
        id: undefined,
        model: undefined,
        json: undefined
      });
    });
  });

  test("have access to handler being used by mockjack", function() {
    let mock = mockQueryRecord('user');
    ok(mock.handler);
  });

  test("using fails makes the request fail", function(assert) {
    Ember.run(function() {
      let done = assert.async();

      mockQueryRecord('user').fails();
      FactoryGuy.get('store').queryRecord('user', {})
        .catch(()=> {
          ok(true);
          done();
        });

    });
  });

  test("using returns with headers adds the headers to the response", function(assert) {
    var done = assert.async();

    const queryParams = { name: 'MyCompany' };
    const handler = mockQueryRecord('company', queryParams);
    handler.returns({ headers: { 'X-Testing': 'absolutely' } });

    $(document).ajaxComplete(function(event, xhr) {
      assert.equal(xhr.getResponseHeader('X-Testing'), 'absolutely');
      $(document).off('ajaxComplete');
      done();
    });

    FactoryGuy.get('store').query('company', queryParams);
  });

  test("using returns 'model' with array of DS.Models throws error", function(assert) {
    assert.throws(function() {
      let bobs = makeList('user', 2, { name: 'Bob' });
      mockQueryRecord('user', { name: 'Bob' }).returns({ model: bobs });
    }, "can't pass array of models to mock queryRecord");
  });

  test("using returns with json returns and creates model", function(assert) {
    Ember.run(function() {
      let done = assert.async();

      let bob = FactoryGuy.build('user', { name: 'Bob' });
      mockQueryRecord('user', { name: 'Bob' }).returns({ json: bob });
      FactoryGuy.get('store').queryRecord('user', { name: 'Bob' }).then(function(user) {
        equal(user.id, bob.get('id'));
        equal(user.get('name'), bob.get('name'));
        // makes the user after getting query response
        equal(FactoryGuy.get('store').peekAll('user').get('content').length, 1);
        done();
      });
    });
  });

  test("using returns with model instance returns that model, and does not create new one", function(assert) {
    Ember.run(function() {
      let done = assert.async();

      let bob = make('user');
      mockQueryRecord('user', { name: 'Bob' }).returns({ model: bob });

      FactoryGuy.get('store').queryRecord('user', { name: 'Bob' }).then(function(user) {
        equal(user, bob, "returns the same user");
        equal(FactoryGuy.get('store').peekAll('user').get('content').length, 1, "does not create a new model");
        done();
      });
    });
  });

  test("using returns with model id returns that model, and does not create new one", function(assert) {
    Ember.run(function() {
      let done = assert.async();

      let bob = make('user');
      mockQueryRecord('user', { name: 'Bob' }).returns({ id: bob.id });

      FactoryGuy.get('store').queryRecord('user', { name: 'Bob' }).then(function(user) {
        equal(user, bob, "returns the same user");
        equal(FactoryGuy.get('store').peekAll('user').get('content').length, 1, "does not create a new model");
        done();
      });
    });
  });

  test("twice using returns with differnet json and different params returns different results", function(assert) {
    Ember.run(function() {
      let done = assert.async();

      let company1 = FactoryGuy.build('company');
      mockQueryRecord('company', { name: 'Dude' }).returns({ json: company1 });

      let company2 = FactoryGuy.build('company');
      mockQueryRecord('company', { type: 'Small' }).returns({ json: company2 });

      FactoryGuy.get('store').queryRecord('company', { name: 'Dude' }).then(function(company) {
        equal(company.get('id'), company1.get('id'));

        FactoryGuy.get('store').queryRecord('company', { type: 'Small' }).then(function(company) {
          equal(company.get('id'), company2.get('id'));
          done();
        });
      });
    });
  });

  test("reusing mock using returns with differnt json and withParams with different params returns different results", function(assert) {
    Ember.run(function() {
      let done = assert.async();

      let company1 = FactoryGuy.build('company');
      let company2 = FactoryGuy.build('company');

      let mockQuery = mockQueryRecord('company', { name: 'Dude' }).returns({ json: company1 });
      FactoryGuy.get('store').queryRecord('company', { name: 'Dude' }).then(function(company) {
        equal(company.get('id'), company1.get('id'));

        mockQuery.withParams({ type: 'Small' }).returns({ json: company2 });
        FactoryGuy.get('store').queryRecord('company', { type: 'Small' }).then(function(company) {
          equal(company.get('id'), company2.get('id'));
          done();
        });
      });
    });
  });

};

/////// mockCreate //////////

SharedBehavior.handleCreateTests = function() {

  test("the basic", function(assert) {
    Ember.run(function() {
      let done = assert.async();
      let customDescription = "special description";

      mockCreate('profile', {
        match: { description: customDescription }
      });
      ok(FactoryGuy.get('store').peekAll('profile').get('content.length') === 0);
      FactoryGuy.get('store').createRecord('profile', {
        description: customDescription
      }).save().then(function(profile) {
        ok(FactoryGuy.get('store').peekAll('profile').get('content.length') === 1, 'No extra records created');
        ok(profile instanceof Profile, 'Creates the correct type of record');
        ok(profile.get('description') === customDescription, 'Passes along the match attributes');
        done();
      });
    });
  });


  /////// with hash of parameters ///////////////////
  test("with no specific match", function(assert) {
    Ember.run(function() {
      let done = assert.async();
      mockCreate('profile');

      FactoryGuy.get('store').createRecord('profile', { description: 'whatever' }).save().then(function(profile) {
        ok(profile.id === "1");
        ok(profile.get('description') === 'whatever');
        done();
      });

    });
  });

  test("with no specific match creates many in a loop", function(assert) {
    Ember.run(function() {
      let done = assert.async();

      mockCreate('profile');

      let promises = [1, 2, 3].map(function() {
        return FactoryGuy.get('store').createRecord('profile', { description: 'whatever' }).save();
      });

      Ember.RSVP.all(promises).then(function(profiles) {
        let ids = profiles.map(function(profile) {
          return profile.get('id');
        });
        let descriptions = profiles.map(function(profile) {
          return profile.get('description');
        });
        ok(ids + '' === [1, 2, 3] + '');
        ok(descriptions + '' === ['whatever', 'whatever', 'whatever'] + '');
        done();
      });
    });
  });

  test("match some attributes", function(assert) {
    Ember.run(function() {
      let done = assert.async();
      let customDescription = "special description";
      let date = new Date();

      mockCreate('profile', { match: { description: customDescription } });

      FactoryGuy.get('store').createRecord('profile', {
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
    Ember.run(function() {
      let done = assert.async();
      let customDescription = "special description";
      let date = new Date();

      mockCreate('profile', {
        match: { description: customDescription, created_at: date }
      });

      FactoryGuy.get('store').createRecord('profile', {
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


  test("returns attributes", function(assert) {
    Ember.run(function() {
      let done = assert.async();
      let date = new Date();

      mockCreate('profile', {
        returns: { created_at: date, description: 'mano' }
      });

      FactoryGuy.get('store').createRecord('profile').save().then(function(profile) {
        ok(profile.get("created_at") + '' === date + '');
        done();
      });
    });
  });

  test("match belongsTo association", function(assert) {
    Ember.run(function() {
      let done = assert.async();
      let company = make('company');
      mockCreate('profile', { match: { company: company } });

      FactoryGuy.get('store').createRecord('profile', { company: company }).save().then(function(profile) {
        ok(profile.get('company') === company);
        done();
      });
    });
  });

  test("match belongsTo polymorphic association", function(assert) {
    Ember.run(function() {
      let done = assert.async();
      let group = make('group');
      mockCreate('profile', { match: { group: group } });

      FactoryGuy.get('store').createRecord('profile', { group: group }).save().then(function(profile) {
        ok(profile.get('group') === group);
        done();
      });
    });
  });


  test("match attributes and return attributes", function(assert) {
    Ember.run(function() {
      let done = assert.async();
      let date = new Date();
      let customDescription = "special description";
      let company = make('company');
      let group = make('big-group');

      mockCreate('profile', {
        match: { description: customDescription, company: company, group: group },
        returns: { created_at: new Date() }
      });

      FactoryGuy.get('store').createRecord('profile', {
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


  test("failure", function(assert) {
    Ember.run(function() {
      let done = assert.async();
      mockCreate('profile').fails();

      FactoryGuy.get('store').createRecord('profile').save()
        .catch(()=> {
          ok(true);
          done();
        });
    });
  });

  test("failure with status code 422 and errors in response", function(assert) {
    Ember.run(function() {
      let done = assert.async();

      let errors = { errors: { description: ['bad'] } };
      mockCreate('profile').fails({ status: 422, response: errors });

      let profile = FactoryGuy.get('store').createRecord('profile');
      profile.save()
        .catch(()=> {
          //let errors = invalidError.errors[0];
          //console.log('A',invalidError.errors);
          //console.log('B',profile.get('errors.messages'));
          //let errors = profile.get('errors.messages')[0];
          //equal(errors.title, 'invalid description');
          //equal(errors.detail, 'bad');
          ok(true);
          done();
        });
    });
  });


  test("match but still fail", function(assert) {
    Ember.run(function() {
      let done = assert.async();
      let description = "special description";

      mockCreate('profile', {
        match: { description: description }
      }).fails();

      FactoryGuy.get('store').createRecord('profile', { description: description }).save()
        .catch(()=> {
          ok(true);
          done();
        });
    });
  });

  test("fails when match args not present in createRecord attributes", function(assert) {
    Ember.run(function() {
      let done = assert.async();

      mockCreate('profile', { match: { description: 'correct description' } });

      FactoryGuy.get('store').createRecord('profile', { description: 'wrong description' }).save()
        .catch(()=> {
          ok(true);
          done();
        });
    });
  });


  /////// mockCreate //////////
  /////// with chaining methods ///////////////////

  test("match some attributes with match method", function(assert) {
    Ember.run(function() {
      let done = assert.async();
      let customDescription = "special description";
      let date = new Date();

      mockCreate('profile').match({ description: customDescription });

      FactoryGuy.get('store').createRecord('profile', {
        description: customDescription, created_at: date
      }).save().then(function(profile) {
        ok(profile instanceof Profile);
        ok(profile.id === '1');
        ok(profile.get('description') === customDescription);
        done();
      });
    });
  });

  test("match all attributes with match method", function(assert) {
    Ember.run(function() {
      let done = assert.async();
      let customDescription = "special description";
      let date = new Date();

      mockCreate('profile').match({ description: customDescription, created_at: date });

      FactoryGuy.get('store').createRecord('profile', {
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

  test("match belongsTo association with match method", function(assert) {
    Ember.run(function() {
      let done = assert.async();
      let company = make('company');

      mockCreate('profile').match({ company: company });

      FactoryGuy.get('store').createRecord('profile', { company: company }).save().then(function(profile) {
        ok(profile.get('company') === company);
        done();
      });
    });
  });

  test("match belongsTo polymorphic association  with match method", function(assert) {
    Ember.run(function() {
      let done = assert.async();
      let group = make('group');
      mockCreate('profile').match({ group: group });

      FactoryGuy.get('store').createRecord('profile', { group: group }).save().then(function(profile) {
        ok(profile.get('group') === group);
        done();
      });
    });
  });


  test("using returns method with attributes", function(assert) {
    Ember.run(function() {
      let done = assert.async();
      let date = new Date();

      mockCreate('profile').returns({ created_at: date });

      FactoryGuy.get('store').createRecord('profile').save().then(function(profile) {
        ok(profile.get('created_at').toString() === date.toString());
        done();
      });
    });
  });


  test("using returns method with user-supplied model id", function(assert) {
    Ember.run(function() {
      let done = assert.async();
      let id = 42;

      mockCreate('profile').returns({ id: id });

      FactoryGuy.get('store').createRecord('profile').save().then(function(profile) {
        assert.equal(profile.get('id'), id);
        done();
      });
    });
  });


  test("match attributes and return attributes using match and returns methods", function(assert) {
    Ember.run(function() {
      let done = assert.async();
      let date = new Date(2015, 1, 2, 3, 4, 5);
      let customDescription = "special description";
      let company = make('company');
      let group = make('big-group');

      mockCreate('profile')
        .match({ description: customDescription, company: company, group: group })
        .andReturn({ created_at: date });

      FactoryGuy.get('store').createRecord('profile', {
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
    Ember.run(function() {
      let done = assert.async();
      mockCreate('profile').fails();

      FactoryGuy.get('store').createRecord('profile').save()
        .catch(()=> {
          ok(true);
          done();
        });
    });
  });


  test("match but still fail with fails method", function(assert) {
    Ember.run(function() {
      let done = assert.async();
      let description = "special description";

      mockCreate('profile').match({ description: description }).fails();

      FactoryGuy.get('store').createRecord('profile', { description: description }).save()
        .catch(()=> {
          ok(true);
          done();
        });
    });
  });

  test("failure with status code 422 and errors in response with fails method", function(assert) {
    Ember.run(function() {
      let done = assert.async();

      let errors = { errors: { description: ['bad'] } };
      mockCreate('profile').fails({ status: 422, response: errors });

      let profile = FactoryGuy.get('store').createRecord('profile');
      profile.save()
        .catch(()=> {
          //let errors = profile.get('errors.messages')[0];
          //console.log('AA',invalidError.errors);
          //console.log('BB',profile.get('errors.messages'));
          //console.log(profile.get('errors'))
          //equal(errors.title, 'invalid description');
          //equal(errors.detail, 'bad');
          ok(true);
          done();
        });
    });
  });

};

/////// mockUpdate //////////

SharedBehavior.handleUpdateTests = function() {

  test("with incorrect parameters", function(assert) {
    assert.throws(function() {
      mockUpdate();
    }, "missing everything");
    assert.throws(function() {
      mockUpdate('profile');
    }, "missing id");
    assert.throws(function() {
      mockUpdate('profile', {});
    }, "missing id");
  });

  test("with modelType and id", function(assert) {
    Ember.run(function() {
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
    Ember.run(function() {
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
    Ember.run(function() {
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

  test("with modelType and id that fails", function(assert) {
    Ember.run(function() {
      let done = assert.async();
      let profile = make('profile');

      mockUpdate('profile', profile.id).fails({
        status: 500
      });

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

  test("with model that fails with custom response", function(assert) {
    Ember.run(function() {
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

  test("with model that fails with custom status", function(assert) {
    let done = assert.async();
    Ember.run(function() {
      let profile = make('profile');

      mockUpdate(profile).fails({ status: 500 });

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


  test("with model that fails and then succeeds", function(assert) {
    Ember.run(function() {
      let done = assert.async();
      let profile = make('profile');

      let updateMock = mockUpdate(profile).fails({
        status: 400,
        response: { errors: { description: 'invalid data' } }
      });

      profile.set('description', 'new desc');
      profile.save().catch(
        function(reason) {
          let errors = reason.errors;
          equal(errors.description, "invalid data", "Could not save model.");
        }
      ).then(function() {
          updateMock.succeeds();

          ok(!profile.get('valid'), "Profile is invalid.");

          profile.save().then(
            function() {
              ok(!profile.get('saving'), "Saved model");
              ok(profile.get('description') === 'new desc', "Description was updated.");
              done();
            }
          );
        });
    });
  });
};

/////// mockDelete //////////

SharedBehavior.handleDeleteTests = function() {
  test("the basic", function(assert) {
    Ember.run(function() {
      let done = assert.async();
      let profile = make('profile');
      mockDelete('profile', profile.id);

      profile.destroyRecord().then(function() {
        equal(FactoryGuy.get('store').peekAll('profile').get('content.length'), 0);
        done();
      });
    });
  });

  test("failure case", function(assert) {
    Ember.run(function() {
      let done = assert.async();
      let profile = make('profile');
      mockDelete('profile', profile.id, false);

      profile.destroyRecord().catch(
        function() {
          ok(true);
          done();
        }
      );
    });
  });

};


export default SharedBehavior;
