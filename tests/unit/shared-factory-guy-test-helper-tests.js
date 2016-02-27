import Ember from 'ember';
import FactoryGuy, { make, makeList } from 'ember-data-factory-guy';
import TestHelper from 'ember-data-factory-guy/factory-guy-test-helper';
import MissingSequenceError from 'ember-data-factory-guy/missing-sequence-error';
import $ from 'jquery';

import Profile from 'dummy/models/profile';

let SharedBehavior = {};

//////// buildUrl /////////
SharedBehavior.buildUrl = function() {

  test("#buildURL without namespace", function() {
    equal(TestHelper.buildURL('project'), '/projects', 'has no namespace by default');
  });

  test("#buildURL with namespace and host", function() {
    let adapter = FactoryGuy.get('store').adapterFor('application');
    adapter.setProperties({
      host: 'https://dude.com',
      namespace: 'api/v1'
    });

    equal(TestHelper.buildURL('project'), 'https://dude.com/api/v1/projects');
  });

};

//////// handleFind /////////
SharedBehavior.handleFindTests = function() {

  test("the basic returns id", function(assert) {
    Ember.run(function() {
      let done = assert.async();
      let profileId = TestHelper.handleFind('profile');

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
      let profileId = TestHelper.handleFind('profile', { description: 'dude' });

      FactoryGuy.get('store').find('profile', profileId).then(function(profile) {
        ok(profile.get('description') === 'dude');
        done();
      });
    });
  });

  test("handles differently cased attributes", function(assert) {
    Ember.run(function() {
      let done = assert.async();

      let profileId = TestHelper.handleFind('profile', 1);

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
      let profileId = TestHelper.handleFind('profile', 'goofy_description');

      FactoryGuy.get('store').find('profile', profileId).then(function(profile) {
        ok(profile.get('description') === 'goofy');
        done();
      });
    });
  });

  test("with traits and extra options", function(assert) {
    Ember.run(function() {
      let done = assert.async();
      let profileId = TestHelper.handleFind('profile', 'goofy_description', { description: 'dude' });

      FactoryGuy.get('store').find('profile', profileId).then(function(profile) {
        ok(profile.get('description') === 'dude');
        done();
      });
    });
  });


  test("with belongsTo association", function(assert) {
    Ember.run(function() {
      let done = assert.async();
      let profileId = TestHelper.handleFind('profile', 'with_company', 'with_bat_man');

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
      let userId = TestHelper.handleFind('user', 'with_hats');

      FactoryGuy.get('store').find('user', userId).then(function(user) {
        ok(user.get('hats.length') === 2);
        ok(user.get('hats.firstObject.type') === 'BigHat');
        done();
      });
    });
  });
};

//////// handleReload /////////

SharedBehavior.handleReloadTests = function() {

  test("with a record handles reload, and does not change attributes", function(assert) {
    let done = assert.async();
    Ember.run(function() {
      let profile = FactoryGuy.make('profile', { description: "whatever" });
      TestHelper.handleReload(profile);

      profile.reload().then(function(profile2) {
        ok(profile2.id === profile.id);
        ok(profile2.get('description') === profile.get('description'));
        done();
      });
    });
  });


  test("failure with andFail method", function(assert) {
    Ember.run(function() {
      let done = assert.async();
      TestHelper.handleReload('profile', 1).andFail();

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

/////// handleFindAll //////////

SharedBehavior.handleFindAllTests = function() {

  test("the basic", function(assert) {
    Ember.run(function() {
      let done = assert.async();
      TestHelper.handleFindAll('user', 2);

      FactoryGuy.get('store').findAll('user').then(function(users) {
        ok(users.get('length') === 2);
        done();
      });
    });
  });

  test("handles differently cased attributes", function(assert) {
    Ember.run(function() {
      let done = assert.async();

      TestHelper.handleFindAll('profile', 1);

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
      TestHelper.handleFindAll('user', 0);

      FactoryGuy.get('store').findAll('user').then(function(profiles) {
        ok(profiles.get('length') === 0);
        done();
      });
    });
  });

  test("with fixture options", function(assert) {
    Ember.run(function() {
      let done = assert.async();
      TestHelper.handleFindAll('profile', 2, { description: 'dude' });

      FactoryGuy.get('store').findAll('profile').then(function(profiles) {
        ok(profiles.get('length') === 2);
        ok(profiles.get('firstObject.description') === 'dude');
        done();
      });
    });
  });

  test("with traits", function(assert) {
    let done = assert.async();
    TestHelper.handleFindAll('profile', 2, 'goofy_description');

    FactoryGuy.get('store').findAll('profile').then(function(profiles) {
      ok(profiles.get('length') === 2);
      ok(profiles.get('firstObject.description') === 'goofy');
      done();
    });
  });

  test("with traits and extra options", function(assert) {
    let done = assert.async();
    TestHelper.handleFindAll('profile', 2, 'goofy_description', { description: 'dude' });

    FactoryGuy.get('store').findAll('profile').then(function(profiles) {
      ok(profiles.get('length') === 2);
      ok(profiles.get('firstObject.description') === 'dude');
      done();
    });
  });


  test("with belongsTo association", function(assert) {
    Ember.run(function() {
      let done = assert.async();
      TestHelper.handleFindAll('profile', 2, 'with_company', 'with_bat_man');

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
      TestHelper.handleFindAll('user', 2, 'with_hats');

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
      TestHelper.handleFindAll('profile', 'goofy_description', { description: 'foo' }, ['goofy_description', { aBooleanField: true }]);

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


};


/////// handleQuery //////////

SharedBehavior.handleQueryTests = function() {

  test("json payload argument should be an object", function(assert) {
    assert.throws(function() {
      TestHelper.handleQuery('user', 'name', {});
    }, "query argument should not be a string");

    assert.throws(function() {
      TestHelper.handleQuery('user', ['name'], {});
    }, "query argument should not be an array");
  });

  test("mock query not using returns", function(assert) {
    Ember.run(function() {
      let done = assert.async();
      TestHelper.handleQuery('user', { name: 'Bob' });
      FactoryGuy.get('store').query('user', { name: 'Bob' }).then(function(users) {
        equal(users.get('length'), 0, "nothing returned");
        done();
      });
    });
  });

  test("andFail works", function(assert) {
    Ember.run(function() {
      let done = assert.async();
      let errors = { errors: { name: ['wrong'] } };
      TestHelper.handleQuery('user', { name: 'Bob' }).andFail({ status: 422, response: errors });
      FactoryGuy.get('store').query('user', { name: 'Bob' }).then(
        function() {
        }, function() {
          ok(true);
          done();
        });
    });
  });

  test("Nested search params are ok", function(assert) {
    Ember.run(function() {
      let done = assert.async();

      let madeCompanies = FactoryGuy.makeList('company', 2);

      TestHelper.handleQuery('company', { name: { like: 'Dude*' } }).returns(madeCompanies);
      FactoryGuy.get('store').query('company', { name: { like: 'Dude*' } }).then(function(companies) {
        equal(companies.mapBy('id') + '', madeCompanies.mapBy('id') + '');
        done();
      });
    });
  });

  test("mock query using returns with empty array", function(assert) {
    Ember.run(function() {
      let done = assert.async();
      TestHelper.handleQuery('user', { name: 'Bob' }).returns([]);
      FactoryGuy.get('store').query('user', { name: 'Bob' }).then(function(users) {
        equal(users.get('length'), 0, "nothing returned");
        done();
      });
    });
  });

  test("mock query using returns with model instances returns your models, and does not create new ones", function(assert) {
    Ember.run(function() {
      let done = assert.async();
      let bob = FactoryGuy.make('user');

      TestHelper.handleQuery('user', { name: 'Bob' }).returns([bob]);

      FactoryGuy.get('store').query('user', { name: 'Bob' }).then(function(users) {
        equal(users.get('length'), 1);
        equal(users.get('firstObject'), bob);
        // does not make another user
        equal(FactoryGuy.get('store').peekAll('user').get('content').length, 1);
        done();
      });
    });
  });

  test("mock query using returns with model instances having hasMany models", function(assert) {
    Ember.run(function() {
      let done = assert.async();

      let users = FactoryGuy.makeList('user', 2, 'with_hats');
      TestHelper.handleQuery('user', { name: 'Bob' }).returns(users);

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

  test("mock query using returns with model instance with hasMany and belongsTo relationships", function(assert) {
    Ember.run(function() {
      let done = assert.async();

      let users = FactoryGuy.makeList('company', 2, 'with_projects', 'with_profile');
      TestHelper.handleQuery('company', { name: 'Dude Company' }).returnsModels(users);

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

  test("mock queryRecord using returns with model instance return your model, and does not create new one", function(assert) {
    Ember.run(function() {
      let done = assert.async();
      let bob = FactoryGuy.make('user');

      TestHelper.handleQuery('user', { name: 'Bob' }).returns(bob);

      FactoryGuy.get('store').queryRecord('user', { name: 'Bob' }).then(function(user) {
        equal(user.get('id'), bob.id);
        equal(user.get('name'), bob.get('name'));
        // does not make another user
        equal(FactoryGuy.get('store').peekAll('user').get('content').length, 1);
        done();
      });
    });
  });

  test("mock query using returns with json returns and creates models", function(assert) {
    Ember.run(function() {
      let done = assert.async();

      let bobs = FactoryGuy.buildList('user', 1);
      TestHelper.handleQuery('user', { name: 'Bob' }).returns(bobs);
      FactoryGuy.get('store').query('user', { name: 'Bob' }).then(function(users) {
        equal(users.get('length'), 1);
        // makes the user after getting query response
        equal(FactoryGuy.get('store').peekAll('user').get('content').length, 1);
        done();
      });
    });
  });

  test("mock queryRecord using returns with json returns and creates model", function(assert) {
    Ember.run(function() {
      let done = assert.async();

      let bob = FactoryGuy.build('user', { name: 'Bob' });
      TestHelper.handleQuery('user', { name: 'Bob' }).returns(bob);
      FactoryGuy.get('store').queryRecord('user', { name: 'Bob' }).then(function(user) {
        equal(user.id, bob.get('id'));
        equal(user.get('name'), bob.get('name'));
        // makes the user after getting query response
        equal(FactoryGuy.get('store').peekAll('user').get('content').length, 1);
        done();
      });
    });
  });

  // TODO remove soon
  test("returnsExistingIds returns models based on the modelName and the ids provided", function(assert) {
    Ember.run(function() {
      let done = assert.async();

      let bob = FactoryGuy.make('user');

      TestHelper.handleQuery('user', { name: 'Bob' }).returnsExistingIds([bob.id]);
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
  test("query for none than create then query again", function(assert) {
    Ember.run(function() {
      let done = assert.async();
      let store = FactoryGuy.get('store');

      let bobQueryHander = TestHelper.handleQuery('user', { name: 'Bob' });

      store.query('user', { name: 'Bob' }).then(function(users) {
        equal(users.get('length'), 0);

        TestHelper.handleCreate('user', { name: 'Bob' });
        store.createRecord('user', { name: 'Bob' }).save().then(function(user) {

          bobQueryHander.returns([user]);

          store.query('user', { name: 'Bob' }).then(function(users) {
            equal(users.get('length'), 1);
            done();
          });
        });
      });
    });
  });

  test("reusing mock query using returns with different params returns different results", function(assert) {
    Ember.run(function() {
      let done = assert.async();

      let companies1 = FactoryGuy.makeList('company', 2);
      TestHelper.handleQuery('company', { name: 'Dude' }).returns(companies1);

      let companies2 = FactoryGuy.makeList('company', 2);
      TestHelper.handleQuery('company', { type: 'Small' }).returns(companies2);

      FactoryGuy.get('store').query('company', { name: 'Dude' }).then(function(companies) {
        equal(companies.mapBy('id') + '', companies1.mapBy('id') + '');

        FactoryGuy.get('store').query('company', { type: 'Small' }).then(function(companies) {
          equal(companies.mapBy('id') + '', companies2.mapBy('id') + '');
          done();
        });
      });
    });
  });


  test("mock query using return with different query params returns same results", function(assert) {
    Ember.run(function() {
      let done = assert.async();
      let expectedAssertions = 2;

      function finalizeTest() {
        --expectedAssertions;
        if (expectedAssertions === 0) {
          done();
        }
      }

      let companies = FactoryGuy.makeList('company', 2);

      TestHelper.handleQuery('company', { name: 'Dude' }).returns(companies);
      TestHelper.handleQuery('company', { type: 'Small', name: 'Dude' }).returns(companies);

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

  test("reusing mock query using returns and withParams with different params and differnt items returns different results", function(assert) {
    Ember.run(function() {
      let done = assert.async();

      let companies1 = FactoryGuy.makeList('company', 2);
      let companies2 = FactoryGuy.makeList('company', 2);

      let queryHandler = TestHelper.handleQuery('company', { name: 'Dude' }).returns(companies1);
      FactoryGuy.get('store').query('company', { name: 'Dude' }).then(function(companies) {
        equal(companies.mapBy('id') + '', companies1.mapBy('id') + '');

        queryHandler.withParams({ type: 'Small' }).returns(companies2);
        FactoryGuy.get('store').query('company', { type: 'Small' }).then(function(companies) {
          equal(companies.mapBy('id') + '', companies2.mapBy('id') + '');
          done();
        });
      });
    });
  });

};

/////// handleCreate //////////

SharedBehavior.handleCreateTests = function() {

  test("the basic", function(assert) {
    Ember.run(function() {
      let done = assert.async();
      let customDescription = "special description";

      TestHelper.handleCreate('profile', {
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
      TestHelper.handleCreate('profile');

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

      TestHelper.handleCreate('profile');

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

      TestHelper.handleCreate('profile', { match: { description: customDescription } });

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

      TestHelper.handleCreate('profile', {
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

      TestHelper.handleCreate('profile', {
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
      TestHelper.handleCreate('profile', { match: { company: company } });

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
      TestHelper.handleCreate('profile', { match: { group: group } });

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

      TestHelper.handleCreate('profile', {
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
      TestHelper.handleCreate('profile').andFail();

      FactoryGuy.get('store').createRecord('profile').save()
        .then(
        function() {
        },
        function() {
          ok(true);
          done();
        }
      );
    });
  });

  test("failure with status code 422 and errors in response", function(assert) {
    Ember.run(function() {
      let done = assert.async();

      let errors = { errors: { description: ['bad'] } };
      TestHelper.handleCreate('profile').andFail({ status: 422, response: errors });

      let profile = FactoryGuy.get('store').createRecord('profile');
      profile.save()
        .then(
        function() {
        },
        function() {
          //let errors = invalidError.errors[0];
          //console.log('A',invalidError.errors);
          //console.log('B',profile.get('errors.messages'));
          //let errors = profile.get('errors.messages')[0];
          //equal(errors.title, 'invalid description');
          //equal(errors.detail, 'bad');
          ok(true);
          done();
        }
      );
    });
  });


  test("match but still fail", function(assert) {
    Ember.run(function() {
      let done = assert.async();
      let description = "special description";

      TestHelper.handleCreate('profile', {
        match: { description: description }
      }).andFail();

      FactoryGuy.get('store').createRecord('profile', { description: description }).save()
        .then(
        function() {
        },
        function() {
          ok(true);
          done();
        }
      );
    });
  });

  test("fails when match args not present in createRecord attributes", function(assert) {
    Ember.run(function() {
      let done = assert.async();

      TestHelper.handleCreate('profile', { match: { description: 'correct description' } });

      FactoryGuy.get('store').createRecord('profile', { description: 'wrong description' }).save().then(
        function() {
        },
        function() {
          ok(true);
          done();
        });
    });
  });


  /////// handleCreate //////////
  /////// with chaining methods ///////////////////

  test("match some attributes with match method", function(assert) {
    Ember.run(function() {
      let done = assert.async();
      let customDescription = "special description";
      let date = new Date();

      TestHelper.handleCreate('profile').match({ description: customDescription });

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

      TestHelper.handleCreate('profile').match({ description: customDescription, created_at: date });

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

      TestHelper.handleCreate('profile').match({ company: company });

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
      TestHelper.handleCreate('profile').match({ group: group });

      FactoryGuy.get('store').createRecord('profile', { group: group }).save().then(function(profile) {
        ok(profile.get('group') === group);
        done();
      });
    });
  });


  test("returns attributes with andReturns method", function(assert) {
    Ember.run(function() {
      let done = assert.async();
      let date = new Date();

      TestHelper.handleCreate('profile').andReturn({ created_at: date });

      FactoryGuy.get('store').createRecord('profile').save().then(function(profile) {
        ok(profile.get('created_at').toString() === date.toString());
        done();
      });
    });
  });


  test("returns user-supplied model ID", function(assert) {
    Ember.run(function() {
      let done = assert.async();
      let id = 42;

      TestHelper.handleCreate('profile').andReturn({ id: id });

      FactoryGuy.get('store').createRecord('profile').save().then(function(profile) {
        assert.equal(profile.get('id'), id);
        done();
      });
    });
  });


  test("match attributes and return attributes with match and andReturn methods", function(assert) {
    Ember.run(function() {
      let done = assert.async();
      let date = new Date(2015, 1, 2, 3, 4, 5);
      let customDescription = "special description";
      let company = make('company');
      let group = make('big-group');

      TestHelper.handleCreate('profile')
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


  test("failure with andFail method", function(assert) {
    Ember.run(function() {
      let done = assert.async();
      TestHelper.handleCreate('profile').andFail();

      FactoryGuy.get('store').createRecord('profile').save()
        .then(
        function() {
        },
        function() {
          ok(true);
          done();
        }
      );
    });
  });


  test("match but still fail with andFail method", function(assert) {
    Ember.run(function() {
      let done = assert.async();
      let description = "special description";

      TestHelper.handleCreate('profile').match({ description: description }).andFail();

      FactoryGuy.get('store').createRecord('profile', { description: description }).save()
        .then(
        function() {
        },
        function() {
          ok(true);
          done();
        }
      );
    });
  });

  test("failure with status code 422 and errors in response with andFail method", function(assert) {
    Ember.run(function() {
      let done = assert.async();

      let errors = { errors: { description: ['bad'] } };
      TestHelper.handleCreate('profile').andFail({ status: 422, response: errors });

      let profile = FactoryGuy.get('store').createRecord('profile');
      profile.save()
        .then(
        function() {
        },
        function() {
          //let errors = profile.get('errors.messages')[0];
          //console.log('AA',invalidError.errors);
          //console.log('BB',profile.get('errors.messages'));
          //console.log(profile.get('errors'))
          //equal(errors.title, 'invalid description');
          //equal(errors.detail, 'bad');
          ok(true);
          done();
        }
      );
    });
  });

};

/////// handleUpdate //////////

SharedBehavior.handleUpdateTests = function() {

  test("with incorrect parameters", function(assert) {
    assert.throws(function() {
      TestHelper.handleUpdate();
    }, "missing everything");
    assert.throws(function() {
      TestHelper.handleUpdate('profile');
    }, "missing id");
    assert.throws(function() {
      TestHelper.handleUpdate('profile', {});
    }, "missing id");
  });

  test("with modelType and id", function(assert) {
    Ember.run(function() {
      let done = assert.async();
      let profile = make('profile');
      TestHelper.handleUpdate('profile', profile.id);

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
      TestHelper.handleUpdate(profile);

      profile.set('description', 'new desc');
      profile.save().then(function(profile) {
        ok(profile.get('description') === 'new desc');
        done();
      });
    });
  });

  test("the with model that has polymorphic belongsTo", function(assert) {
    Ember.run(function() {
      let done = assert.async();

      let group = make('group');
      let profile = make('profile', { group: group });
      TestHelper.handleUpdate(profile);

      profile.set('description', 'new desc');
      profile.save().then(function(profile) {
        ok(profile.get('description') === 'new desc');
        done();
      });
    });
  });

  test("the with modelType and id that fails", function(assert) {
    Ember.run(function() {
      let done = assert.async();
      let profile = make('profile');

      TestHelper.handleUpdate('profile', profile.id).andFail({ status: 500 });

      profile.set('description', 'new desc');
      profile.save().then(
        function() {
        },
        function() {
          ok(true);
          done();
        }
      );
    });
  });

  test("with model that fails", function(assert) {
    Ember.run(function() {
      let done = assert.async();
      let profile = make('profile');

      TestHelper.handleUpdate(profile).andFail({ status: 500 });

      profile.set('description', 'new desc');
      profile.save().then(
        function() {
        },
        function() {
          ok(true);
          done();
        }
      );
    });
  });

  test("with model that fails with custom response", function(assert) {
    Ember.run(function() {
      let done = assert.async();
      let profile = make('profile');

      TestHelper.handleUpdate(profile).andFail({
        status: 400,
        response: { errors: { description: 'invalid data' } }
      });

      profile.set('description', 'new desc');
      profile.save().then(
        function() {
        },
        function(reason) {
          let errors = reason.errors;
          equal(errors.description, "invalid data");
          done();
        }
      );
    });
  });

  test("with modelType and id that fails chained", function(assert) {
    Ember.run(function() {
      let done = assert.async();
      let profile = make('profile');

      TestHelper.handleUpdate('profile', profile.id).andFail({
        status: 500
      });

      profile.set('description', 'new desc');
      profile.save().then(
        function() {
        },
        function(reason) {
          let error = reason.errors[0];
          equal(error.status, "500");
          done();
        }
      );
    });
  });

  test("with model that fails chained", function(assert) {
    let done = assert.async();
    Ember.run(function() {
      let profile = make('profile');

      TestHelper.handleUpdate(profile).andFail({
        status: 500
      });

      profile.set('description', 'new desc');
      profile.save().then(
        function() {
        },
        function(reason) {
          let error = reason.errors[0];
          equal(error.status, "500");
          done();
        }
      );
    });
  });

  test("with model that fails with custom response", function(assert) {
    let done = assert.async();
    Ember.run(function() {
      let profile = make('profile');

      TestHelper.handleUpdate(profile).andFail({
        status: 400,
        response: { errors: { description: 'invalid data' } }
      });

      profile.set('description', 'new desc');
      profile.save().then(
        function() {
        },
        function(reason) {
          let error = reason.errors[0];
          let errors = reason.errors;
          equal(errors.description, "invalid data");
          done();
        }
      );
    });
  });

  test("with model that fails and then succeeds", function(assert) {
    Ember.run(function() {
      let done = assert.async();
      let profile = make('profile');

      let updateMock = TestHelper.handleUpdate(profile).andFail({
        status: 400,
        response: { errors: { description: 'invalid data' } }
      });

      profile.set('description', 'new desc');
      profile.save().then(
        function() {
        },
        function(reason) {
          let errors = reason.errors;
          equal(errors.description, "invalid data", "Could not save model.");
        }
      ).then(function() {
          updateMock.andSucceed();

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

/////// handleDelete //////////

SharedBehavior.handleDeleteTests = function() {
  test("the basic", function(assert) {
    Ember.run(function() {
      let done = assert.async();
      let profile = make('profile');
      TestHelper.handleDelete('profile', profile.id);

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
      TestHelper.handleDelete('profile', profile.id, false);

      profile.destroyRecord().then(
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


export default SharedBehavior;
