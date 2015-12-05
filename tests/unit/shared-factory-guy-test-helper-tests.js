import Ember from 'ember';
import FactoryGuy, { make, makeList } from 'ember-data-factory-guy';
import TestHelper from 'ember-data-factory-guy/factory-guy-test-helper';
import MissingSequenceError from 'ember-data-factory-guy/missing-sequence-error';
import $ from 'jquery';

import Profile from 'dummy/models/profile';

var SharedBehavior = {};

//////// buildUrl /////////
SharedBehavior.buildUrl = function () {

  test("#buildURL without namespace", function () {
    equal(TestHelper.buildURL('project'), '/projects', 'has no namespace by default');
  });

  test("#buildURL with namespace and host", function () {
    var adapter = FactoryGuy.get('store').adapterFor('application');
    adapter.setProperties({
      host: 'https://dude.com',
      namespace: 'api/v1'
    });

    equal(TestHelper.buildURL('project'), 'https://dude.com/api/v1/projects');
  });

};

//////// handleFind /////////
SharedBehavior.handleFindTests = function () {

  test("the basic returns id", function (assert) {
    Ember.run(function () {
      var done = assert.async();
      var profileId = TestHelper.handleFind('profile');

      FactoryGuy.get('store').find('profile', profileId).then(function (profile) {
        equal(profile.get('id'), profileId);
        equal(profile.get('description'), 'Text goes here');
        done();
      });
    });
  });

  test("with fixture options", function (assert) {
    Ember.run(function () {
      var done = assert.async();
      var profileId = TestHelper.handleFind('profile', {description: 'dude'});

      FactoryGuy.get('store').find('profile', profileId).then(function (profile) {
        ok(profile.get('description') === 'dude');
        done();
      });
    });
  });

  test("handles differently cased attributes", function (assert) {
    Ember.run(function () {
      var done = assert.async();

      var profileId = TestHelper.handleFind('profile', 1);

      FactoryGuy.get('store').find('profile', profileId).then(function (profile) {
        ok(profile.get('camelCaseDescription') === 'textGoesHere');
        ok(profile.get('snake_case_description') === 'text_goes_here');
        done();
      });
    });
  });

  test("with traits", function (assert) {
    Ember.run(function () {
      var done = assert.async();
      var profileId = TestHelper.handleFind('profile', 'goofy_description');

      FactoryGuy.get('store').find('profile', profileId).then(function (profile) {
        ok(profile.get('description') === 'goofy');
        done();
      });
    });
  });

  test("with traits and extra options", function (assert) {
    Ember.run(function () {
      var done = assert.async();
      var profileId = TestHelper.handleFind('profile', 'goofy_description', {description: 'dude'});

      FactoryGuy.get('store').find('profile', profileId).then(function (profile) {
        ok(profile.get('description') === 'dude');
        done();
      });
    });
  });


  test("with belongsTo association", function (assert) {
    Ember.run(function () {
      var done = assert.async();
      var profileId = TestHelper.handleFind('profile', 'with_company', 'with_bat_man');

      FactoryGuy.get('store').find('profile', profileId).then(function (profile) {
        ok(profile.get('company.name') === 'Silly corp');
        ok(profile.get('superHero.name') === 'BatMan');
        done();
      });
    });
  });


  test("with hasMany association", function (assert) {
    Ember.run(function () {
      var done = assert.async();
      var userId = TestHelper.handleFind('user', 'with_hats');

      FactoryGuy.get('store').find('user', userId).then(function (user) {
        ok(user.get('hats.length') === 2);
        ok(user.get('hats.firstObject.type') === 'BigHat');
        done();
      });
    });
  });
};

//////// handleReload /////////

SharedBehavior.handleReloadTests = function () {

  test("with a record handles reload, and does not change attributes", function (assert) {
    var done = assert.async();
    Ember.run(function () {
      var profile = FactoryGuy.make('profile', {description: "whatever"});
      TestHelper.handleReload(profile);

      profile.reload().then(function (profile2) {
        ok(profile2.id === profile.id);
        ok(profile2.get('description') === profile.get('description'));
        done();
      });
    });
  });


  test("failure with andFail method", function (assert) {
    Ember.run(function () {
      var done = assert.async();
      TestHelper.handleReload('profile', 1).andFail();

      FactoryGuy.get('store').find('profile', 1).then(
        function () {
        },
        function () {
          ok(true);
          done();
        }
      );
    });
  });

};

/////// handleFindAll //////////

SharedBehavior.handleFindAllTests = function () {

  test("the basic", function (assert) {
    Ember.run(function () {
      var done = assert.async();
      TestHelper.handleFindAll('user', 2);

      FactoryGuy.get('store').findAll('user').then(function (users) {
        ok(users.get('length') === 2);
        done();
      });
    });
  });

  test("handles differently cased attributes", function (assert) {
    Ember.run(function () {
      var done = assert.async();

      TestHelper.handleFindAll('profile', 1);

      FactoryGuy.get('store').findAll('profile').then(function (profiles) {
        ok(profiles.get('firstObject.camelCaseDescription') === 'textGoesHere');
        ok(profiles.get('firstObject.snake_case_description') === 'text_goes_here');
        done();
      });
    });
  });

  test("asking for no return records", function (assert) {
    Ember.run(function () {
      var done = assert.async();
      TestHelper.handleFindAll('user', 0);

      FactoryGuy.get('store').findAll('user').then(function (profiles) {
        ok(profiles.get('length') === 0);
        done();
      });
    });
  });

  test("with fixture options", function (assert) {
    Ember.run(function () {
      var done = assert.async();
      TestHelper.handleFindAll('profile', 2, {description: 'dude'});

      FactoryGuy.get('store').findAll('profile').then(function (profiles) {
        ok(profiles.get('length') === 2);
        ok(profiles.get('firstObject.description') === 'dude');
        done();
      });
    });
  });

  test("with traits", function (assert) {
    var done = assert.async();
    TestHelper.handleFindAll('profile', 2, 'goofy_description');

    FactoryGuy.get('store').findAll('profile').then(function (profiles) {
      ok(profiles.get('length') === 2);
      ok(profiles.get('firstObject.description') === 'goofy');
      done();
    });
  });

  test("with traits and extra options", function (assert) {
    var done = assert.async();
    TestHelper.handleFindAll('profile', 2, 'goofy_description', {description: 'dude'});

    FactoryGuy.get('store').findAll('profile').then(function (profiles) {
      ok(profiles.get('length') === 2);
      ok(profiles.get('firstObject.description') === 'dude');
      done();
    });
  });


  test("with belongsTo association", function (assert) {
    Ember.run(function () {
      var done = assert.async();
      TestHelper.handleFindAll('profile', 2, 'with_company', 'with_bat_man');

      FactoryGuy.get('store').findAll('profile').then(function (profiles) {
        ok(profiles.get('length') === 2);
        ok(profiles.get('firstObject.company.name') === 'Silly corp');
        ok(profiles.get('lastObject.superHero.name') === 'BatMan');
        done();
      });
    });
  });


  test("with hasMany association", function (assert) {
    Ember.run(function () {
      var done = assert.async();
      TestHelper.handleFindAll('user', 2, 'with_hats');

      FactoryGuy.get('store').findAll('user').then(function (users) {
        ok(users.get('length') === 2);
        ok(users.get('lastObject.hats').mapBy('type')+'' === ['BigHat','BigHat']+'');
        ok(users.get('lastObject.hats').mapBy('id')+'' === [3,4]+'');
        done();
      });
    });
  });


};


/////// handleQuery //////////

SharedBehavior.handleQueryTests = function () {

  test("json payload argument should be an object", function (assert) {
    assert.throws(function () {
      TestHelper.handleQuery('user', 'name', {});
    }, "query argument should not be a string");

    assert.throws(function () {
      TestHelper.handleQuery('user', ['name'], {});
    }, "query argument should not be an array");
  });

  test("passing in nothing as last argument returns no results", function (assert) {
    Ember.run(function () {
      var done = assert.async();
      TestHelper.handleQuery('user', {name: 'Bob'});
      FactoryGuy.get('store').query('user', {name: 'Bob'}).then(function (users) {
        equal(users.get('length'), 0);
        done();
      });
    });
  });

  test("returnsModels with no models", function (assert) {
    Ember.run(function () {
      var done = assert.async();
      TestHelper.handleQuery('user', {name: 'Bob'}).returnsModels([]);
      FactoryGuy.get('store').query('user', {name: 'Bob'}).then(function (users) {
        equal(users.get('length'), 0);
        done();
      });
    });
  });

  test("andFail works", function (assert) {
    Ember.run(function () {
      var done = assert.async();
      var errors = {errors: {name: ['wrong']}};
      TestHelper.handleQuery('user', {name: 'Bob'}).andFail({status: 422, response: errors});
      FactoryGuy.get('store').query('user', {name: 'Bob'}).then(
        function () {
      }, function() {
        ok(true);
        done();
      });
    });
  });


  test("returnsModels returns your models, and does not create new ones", function (assert) {
    Ember.run(function () {
      var done = assert.async();
      var bob = FactoryGuy.make('user');

      TestHelper.handleQuery('user', {name: 'Bob'}).returnsModels([bob]);

      FactoryGuy.get('store').query('user', {name: 'Bob'}).then(function (users) {
        equal(users.get('length'), 1);
        equal(users.get('firstObject'), bob);
        // does not make another user
        equal(FactoryGuy.get('store').peekAll('user').get('content').length, 1);
        done();
      });
    });
  });

  test("returnsJSON returns and creates models from the query response", function (assert) {
    Ember.run(function () {
      var done = assert.async();

      var bobs = FactoryGuy.buildList('user',1);
      TestHelper.handleQuery('user', {name: 'Bob'}).returnsJSON(bobs);
      FactoryGuy.get('store').query('user', {name: 'Bob'}).then(function (users) {
        equal(users.get('length'), 1);
        // makes the user after getting query response
        equal(FactoryGuy.get('store').peekAll('user').get('content').length, 1);
        done();
      });
    });
  });

  test("returnsExistingIds returns models based on the modelName and the ids provided", function (assert) {
    Ember.run(function () {
      var done = assert.async();

      var bob = FactoryGuy.make('user');

      TestHelper.handleQuery('user', {name: 'Bob'}).returnsExistingIds([bob.id]);
      FactoryGuy.get('store').query('user', {name: 'Bob'}).then(function (users) {
        equal(users.get('length'), 1);
        equal(users.get('firstObject') , bob);
        // does not create a new model
        equal(FactoryGuy.get('store').peekAll('user').get('content').length, 1);
        done();
      });
    });
  });

  // test created for issue #143
  test("query for none than create then query again", function (assert) {
    Ember.run(function () {
      var done = assert.async();
      var store = FactoryGuy.get('store');

      var bobQueryHander = TestHelper.handleQuery('user', {name: 'Bob'});

      store.query('user', {name: 'Bob'}).then(function (users) {
        equal(users.get('length'), 0);

        TestHelper.handleCreate('user', {name: 'Bob'});
        store.createRecord('user', {name: 'Bob'}).save().then(function(user){

          bobQueryHander.returnsExistingIds([1]);

          store.query('user', {name: 'Bob'}).then(function (users) {
            equal(users.get('length'), 1);
            done();
          });
        });
      });
    });
  });


  test("returnsModels with hasMany models", function (assert) {
    Ember.run(function () {
      var done = assert.async();

      var users = FactoryGuy.makeList('user', 2, 'with_hats');
      TestHelper.handleQuery('user', {name: 'Bob'}).returnsModels(users);

      equal(FactoryGuy.get('store').peekAll('user').get('content.length'), 2, 'start out with 2 instances');

      FactoryGuy.get('store').query('user', {name: 'Bob'}).then(function (users) {
        equal(users.get('length'), 2);
        equal(users.get('firstObject.name'), 'User1');
        equal(users.get('firstObject.hats.length'), 2);
        equal(users.get('lastObject.name'), 'User2');
        equal(FactoryGuy.get('store').peekAll('user').get('content.length'), 2, 'no new instances created');
        done();
      });
    });
  });

  test("returnsModels with hasMany and belongsTo", function (assert) {
    Ember.run(function () {
      var done = assert.async();

      var users = FactoryGuy.makeList('company', 2, 'with_projects', 'with_profile');
      TestHelper.handleQuery('company', {name: 'Dude Company'}).returnsModels(users);

      equal(FactoryGuy.get('store').peekAll('company').get('content.length'), 2, 'start out with 2 instances');

      FactoryGuy.get('store').query('company', {name: 'Dude Company'}).then(function (companies) {
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

  test("using different query params returns different results", function (assert) {
    Ember.run(function () {
      var done = assert.async();

      var companies1 = FactoryGuy.makeList('company', 2);
      TestHelper.handleQuery('company', {name: 'Dude'}).returnsModels(companies1);

      var companies2 = FactoryGuy.makeList('company', 2);
      TestHelper.handleQuery('company', {type: 'Small'}).returnsModels(companies2);

      FactoryGuy.get('store').query('company', {name: 'Dude'}).then(function (companies) {
        equal(companies.mapBy('id')+'', companies1.mapBy('id')+'');

        FactoryGuy.get('store').query('company', {type: 'Small'}).then(function (companies) {
          equal(companies.mapBy('id')+'', companies2.mapBy('id')+'');
          done();
        });
      });
    });
  });


  test("using different query params returns same results", function (assert) {
     Ember.run(function () {
       var done = assert.async();
       var expectedAssertions = 2;

       function finalizeTest() {
         --expectedAssertions;
         if(expectedAssertions === 0) { done(); }
       }

       var companies = FactoryGuy.makeList('company', 2);

       TestHelper.handleQuery('company', {name: 'Dude'}).returnsModels(companies);
       TestHelper.handleQuery('company', {type: 'Small', name: 'Dude'}).returnsModels(companies);

       var request1 = FactoryGuy.get('store').query('company', { name: 'Dude' });
       var request2 = FactoryGuy.get('store').query('company', {type: 'Small', name: 'Dude'});

       request1.then(function (returnedCompanies) {
         equal(companies.mapBy('id')+'', returnedCompanies.mapBy('id')+'');
         finalizeTest();
       });

       request2.then(function (returnedCompanies) {
         equal(companies.mapBy('id')+'', returnedCompanies.mapBy('id')+'');
         finalizeTest();
       });
     });
   });

  test("changing query params with withParams returns different results", function (assert) {
    Ember.run(function () {
      var done = assert.async();

      var companies1 = FactoryGuy.makeList('company', 2);
      var companies2 = FactoryGuy.makeList('company', 2);

      var queryHandler = TestHelper.handleQuery('company', {name: 'Dude'}).returnsModels(companies1);
      FactoryGuy.get('store').query('company', {name: 'Dude'}).then(function (companies) {
        equal(companies.mapBy('id')+'', companies1.mapBy('id')+'');

        queryHandler.withParams({type: 'Small'}).returnsModels(companies2);
        FactoryGuy.get('store').query('company', {type: 'Small'}).then(function (companies) {
          equal(companies.mapBy('id')+'', companies2.mapBy('id')+'');
          done();
        });
      });
    });
  });
};


/////// handleCreate //////////

SharedBehavior.handleCreateTests = function () {

  test("the basic", function (assert) {
    Ember.run(function () {
      var done = assert.async();
      var customDescription = "special description";

      TestHelper.handleCreate('profile', {
        match: {description: customDescription}
      });
      ok(FactoryGuy.get('store').peekAll('profile').get('content.length') === 0);
      FactoryGuy.get('store').createRecord('profile', {
        description: customDescription
      }).save().then(function (profile) {
        ok(FactoryGuy.get('store').peekAll('profile').get('content.length') === 1, 'No extra records created');
        ok(profile instanceof Profile, 'Creates the correct type of record');
        ok(profile.get('description') === customDescription, 'Passes along the match attributes');
        done();
      });
    });
  });


  /////// with hash of parameters ///////////////////
  test("with no specific match", function (assert) {
    Ember.run(function () {
      var done = assert.async();
      TestHelper.handleCreate('profile');

      FactoryGuy.get('store').createRecord('profile', {description: 'whatever'}).save().then(function (profile) {
        ok(profile.id === "1");
        ok(profile.get('description') === 'whatever');
        done();
      });

    });
  });

  test("with no specific match creates many in a loop", function (assert) {
    Ember.run(function () {
      var done = assert.async();

      TestHelper.handleCreate('profile');

      var promises = [1, 2, 3].map(function () {
        return FactoryGuy.get('store').createRecord('profile', {description: 'whatever'}).save();
      });

      Ember.RSVP.all(promises).then(function (profiles) {
        var ids = profiles.map(function (profile) {
          return profile.get('id');
        });
        var descriptions = profiles.map(function (profile) {
          return profile.get('description');
        });
        ok(ids + '' === [1, 2, 3] + '');
        ok(descriptions + '' === ['whatever', 'whatever', 'whatever'] + '');
        done();
      });
    });
  });

  test("match some attributes", function (assert) {
    Ember.run(function () {
      var done = assert.async();
      var customDescription = "special description";
      var date = new Date();

      TestHelper.handleCreate('profile', {match: {description: customDescription}});

      FactoryGuy.get('store').createRecord('profile', {
        description: customDescription, created_at: date
      }).save().then(function (profile) {
        ok(profile instanceof Profile);
        ok(profile.id === '1');
        ok(profile.get('description') === customDescription);
        done();
      });
    });
  });

  test("match all attributes", function (assert) {
    Ember.run(function () {
      var done = assert.async();
      var customDescription = "special description";
      var date = new Date();

      TestHelper.handleCreate('profile', {
        match: {description: customDescription, created_at: date}
      });

      FactoryGuy.get('store').createRecord('profile', {
        description: customDescription, created_at: date
      }).save().then(function (profile) {
        ok(profile instanceof Profile);
        ok(profile.id === '1');
        ok(profile.get('description') === customDescription);
        ok(profile.get('created_at').toString() === date.toString());
        done();
      });
    });
  });


  test("returns attributes", function (assert) {
    Ember.run(function () {
      var done = assert.async();
      var date = new Date();

      TestHelper.handleCreate('profile', {
        returns: {created_at: date, description: 'mano'}
      });

      FactoryGuy.get('store').createRecord('profile').save().then(function (profile) {
        ok(profile.get("created_at") + '' === date + '');
        done();
      });
    });
  });

  test("match belongsTo association", function (assert) {
    Ember.run(function () {
      var done = assert.async();
      var company = make('company');
      TestHelper.handleCreate('profile', {match: {company: company}});

      FactoryGuy.get('store').createRecord('profile', {company: company}).save().then(function (profile) {
        ok(profile.get('company') === company);
        done();
      });
    });
  });

  test("match belongsTo polymorphic association", function (assert) {
    Ember.run(function () {
      var done = assert.async();
      var group = make('group');
      TestHelper.handleCreate('profile', {match: {group: group}});

      FactoryGuy.get('store').createRecord('profile', {group: group}).save().then(function (profile) {
        ok(profile.get('group') === group);
        done();
      });
    });
  });


  test("match attributes and return attributes", function (assert) {
    Ember.run(function () {
      var done = assert.async();
      var date = new Date();
      var customDescription = "special description";
      var company = make('company');
      var group = make('big-group');

      TestHelper.handleCreate('profile', {
        match: {description: customDescription, company: company, group: group},
        returns: {created_at: new Date()}
      });

      FactoryGuy.get('store').createRecord('profile', {
        description: customDescription, company: company, group: group
      }).save().then(function (profile) {
        ok(profile.get('created_at').toString() === date.toString());
        ok(profile.get('group') === group);
        ok(profile.get('company') === company);
        ok(profile.get('description') === customDescription);
        done();
      });
    });
  });


  test("failure", function (assert) {
    Ember.run(function () {
      var done = assert.async();
      TestHelper.handleCreate('profile', {succeed: false});

      FactoryGuy.get('store').createRecord('profile').save()
        .then(
        function () {
        },
        function () {
          ok(true);
          done();
        }
      );
    });
  });

  test("failure with status code 422 and errors in response", function (assert) {
    Ember.run(function () {
      var done = assert.async();

      var errors = {errors: {description: ['bad']}};
      TestHelper.handleCreate('profile').andFail({status: 422, response: errors});

      var profile = FactoryGuy.get('store').createRecord('profile');
      profile.save()
        .then(
        function () {
        },
        function () {
          //var errors = invalidError.errors[0];
          //console.log('A',invalidError.errors);
          //console.log('B',profile.get('errors.messages'));
          //var errors = profile.get('errors.messages')[0];
          //equal(errors.title, 'invalid description');
          //equal(errors.detail, 'bad');
          ok(true);
          done();
        }
      );
    });
  });


  test("match but still fail", function (assert) {
    Ember.run(function () {
      var done = assert.async();
      var description = "special description";

      TestHelper.handleCreate('profile', {
        match: {description: description}, succeed: false
      });

      FactoryGuy.get('store').createRecord('profile', {description: description}).save()
        .then(
        function () {
        },
        function () {
          ok(true);
          done();
        }
      );
    });
  });

  test("fails when match args not present in createRecord attributes", function (assert) {
    Ember.run(function () {
      var done = assert.async();

      TestHelper.handleCreate('profile', {match: {description: 'correct description'}});

      FactoryGuy.get('store').createRecord('profile', {description: 'wrong description'}).save().then(
        function () {
        },
        function () {
          ok(true);
          done();
        });
    });
  });


/////// handleCreate //////////
/////// with chaining methods ///////////////////

  test("match some attributes with match method", function (assert) {
    Ember.run(function () {
      var done = assert.async();
      var customDescription = "special description";
      var date = new Date();

      TestHelper.handleCreate('profile').match({description: customDescription});

      FactoryGuy.get('store').createRecord('profile', {
        description: customDescription, created_at: date
      }).save().then(function (profile) {
        ok(profile instanceof Profile);
        ok(profile.id === '1');
        ok(profile.get('description') === customDescription);
        done();
      });
    });
  });

  test("match all attributes with match method", function (assert) {
    Ember.run(function () {
      var done = assert.async();
      var customDescription = "special description";
      var date = new Date();

      TestHelper.handleCreate('profile').match({description: customDescription, created_at: date});

      FactoryGuy.get('store').createRecord('profile', {
        description: customDescription, created_at: date
      }).save().then(function (profile) {
        ok(profile instanceof Profile);
        ok(profile.id === '1');
        ok(profile.get('description') === customDescription);
        ok(profile.get('created_at').toString() === date.toString());
        done();
      });
    });
  });

  test("match belongsTo association with match method", function (assert) {
    Ember.run(function () {
      var done = assert.async();
      var company = make('company');

      TestHelper.handleCreate('profile').match({company: company});

      FactoryGuy.get('store').createRecord('profile', {company: company}).save().then(function (profile) {
        ok(profile.get('company') === company);
        done();
      });
    });
  });

  test("match belongsTo polymorphic association  with match method", function (assert) {
    Ember.run(function () {
      var done = assert.async();
      var group = make('group');
      TestHelper.handleCreate('profile').match({group: group});

      FactoryGuy.get('store').createRecord('profile', {group: group}).save().then(function (profile) {
        ok(profile.get('group') === group);
        done();
      });
    });
  });


  test("returns attributes with andReturns method", function (assert) {
    Ember.run(function () {
      var done = assert.async();
      var date = new Date();

      TestHelper.handleCreate('profile').andReturn({created_at: date});

      FactoryGuy.get('store').createRecord('profile').save().then(function (profile) {
        ok(profile.get('created_at').toString() === date.toString());
        done();
      });
    });
  });


  test("returns user-supplied model ID", function (assert) {
    Ember.run(function () {
      var done = assert.async();
      var id = 42;

      TestHelper.handleCreate('profile').andReturn({id: id});

      FactoryGuy.get('store').createRecord('profile').save().then(function (profile) {
        assert.equal(profile.get('id'), id);
        done();
      });
    });
  });


  test("match attributes and return attributes with match and andReturn methods", function (assert) {
    Ember.run(function () {
      var done = assert.async();
      var date = new Date();
      var customDescription = "special description";
      var company = make('company');
      var group = make('big-group');

      TestHelper.handleCreate('profile')
        .match({description: customDescription, company: company, group: group})
        .andReturn({created_at: new Date()});

      FactoryGuy.get('store').createRecord('profile', {
        description: customDescription, company: company, group: group
      }).save().then(function (profile) {
        ok(profile.get('created_at').toString() === date.toString());
        ok(profile.get('group') === group);
        ok(profile.get('company') === company);
        ok(profile.get('description') === customDescription);
        done();
      });
    });
  });


  test("failure with andFail method", function (assert) {
    Ember.run(function () {
      var done = assert.async();
      TestHelper.handleCreate('profile').andFail();

      FactoryGuy.get('store').createRecord('profile').save()
        .then(
        function () {
        },
        function () {
          ok(true);
          done();
        }
      );
    });
  });


  test("match but still fail with andFail method", function (assert) {
    Ember.run(function () {
      var done = assert.async();
      var description = "special description";

      TestHelper.handleCreate('profile').match({description: description}).andFail();

      FactoryGuy.get('store').createRecord('profile', {description: description}).save()
        .then(
        function () {
        },
        function () {
          ok(true);
          done();
        }
      );
    });
  });

  test("failure with status code 422 and errors in response with andFail method", function (assert) {
    Ember.run(function () {
      var done = assert.async();

      var errors = {errors: {description: ['bad']}};
      TestHelper.handleCreate('profile').andFail({status: 422, response: errors});

      var profile = FactoryGuy.get('store').createRecord('profile');
      profile.save()
        .then(
        function () {
        },
        function () {
          //var errors = profile.get('errors.messages')[0];
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

SharedBehavior.handleUpdateTests = function () {

  test("with incorrect parameters", function (assert) {
    assert.throws(function () {
      TestHelper.handleUpdate();
    }, "missing everything");
    assert.throws(function () {
      TestHelper.handleUpdate('profile');
    }, "missing id");
    assert.throws(function () {
      TestHelper.handleUpdate('profile', {});
    }, "missing id");
  });

  test("with modelType and id", function (assert) {
    Ember.run(function () {
      var done = assert.async();
      var profile = make('profile');
      TestHelper.handleUpdate('profile', profile.id);

      profile.set('description', 'new desc');
      profile.save().then(function (profile) {
        ok(profile.get('description') === 'new desc');
        done();
      });
    });
  });


  test("with model", function (assert) {
    Ember.run(function () {
      var done = assert.async();
      var profile = make('profile');
      TestHelper.handleUpdate(profile);

      profile.set('description', 'new desc');
      profile.save().then(function (profile) {
        ok(profile.get('description') === 'new desc');
        done();
      });
    });
  });

  test("the with model that has polymorphic belongsTo", function (assert) {
    Ember.run(function () {
      var done = assert.async();

      var group = make('group');
      var profile = make('profile', {group: group});
      TestHelper.handleUpdate(profile);

      profile.set('description', 'new desc');
      profile.save().then(function (profile) {
        ok(profile.get('description') === 'new desc');
        done();
      });
    });
  });

  test("the with modelType and id that fails", function (assert) {
    Ember.run(function () {
      var done = assert.async();
      var profile = make('profile');

      TestHelper.handleUpdate('profile', profile.id, {succeed: false, status: 500});

      profile.set('description', 'new desc');
      profile.save().then(
        function () {
        },
        function () {
          ok(true);
          done();
        }
      );
    });
  });

  test("with model that fails", function (assert) {
    Ember.run(function () {
      var done = assert.async();
      var profile = make('profile');

      TestHelper.handleUpdate(profile, {succeed: false, status: 500});

      profile.set('description', 'new desc');
      profile.save().then(
        function () {
        },
        function () {
          ok(true);
          done();
        }
      );
    });
  });

  test("with model that fails with custom response", function (assert) {
    Ember.run(function () {
      var done = assert.async();
      var profile = make('profile');

      TestHelper.handleUpdate(profile, {
        succeed: false,
        status: 400,
        response: {errors: {description: 'invalid data'}}
      });

      profile.set('description', 'new desc');
      profile.save().then(
        function () {
        },
        function (reason) {
          var errors = reason.errors;
          equal(errors.description, "invalid data");
          done();
        }
      );
    });
  });

  test("with modelType and id that fails chained", function (assert) {
    Ember.run(function () {
      var done = assert.async();
      var profile = make('profile');

      TestHelper.handleUpdate('profile', profile.id).andFail({
        status: 500
      });

      profile.set('description', 'new desc');
      profile.save().then(
        function () {
        },
        function (reason) {
          var error = reason.errors[0];
          equal(error.status, "500");
          done();
        }
      );
    });
  });

  test("with model that fails chained", function (assert) {
    var done = assert.async();
    Ember.run(function () {
      var profile = make('profile');

      TestHelper.handleUpdate(profile).andFail({
        status: 500
      });

      profile.set('description', 'new desc');
      profile.save().then(
        function () {
        },
        function (reason) {
          var error = reason.errors[0];
          equal(error.status, "500");
          done();
        }
      );
    });
  });

  test("with model that fails with custom response", function (assert) {
    var done = assert.async();
    Ember.run(function () {
      var profile = make('profile');

      TestHelper.handleUpdate(profile).andFail({
        status: 400,
        response: {errors: {description: 'invalid data'}}
      });

      profile.set('description', 'new desc');
      profile.save().then(
        function () {
        },
        function (reason) {
          var error = reason.errors[0];
          var errors = reason.errors;
          equal(errors.description, "invalid data");
          done();
        }
      );
    });
  });

  test("with model that fails and then succeeds", function (assert) {
    Ember.run(function () {
      var done = assert.async();
      var profile = make('profile');

      var updateMock = TestHelper.handleUpdate(profile).andFail({
        status: 400,
        response: {errors: {description: 'invalid data'}}
      });

      profile.set('description', 'new desc');
      profile.save().then(
        function () {
        },
        function (reason) {
          var errors = reason.errors;
          equal(errors.description, "invalid data", "Could not save model.");
        }
      ).then(function () {
          updateMock.andSucceed();

          ok(!profile.get('valid'), "Profile is invalid.");

          profile.save().then(
            function () {
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

SharedBehavior.handleDeleteTests = function () {
  test("the basic", function (assert) {
    Ember.run(function () {
      var done = assert.async();
      var profile = make('profile');
      TestHelper.handleDelete('profile', profile.id);

      profile.destroyRecord().then(function () {
        equal(FactoryGuy.get('store').peekAll('profile').get('content.length'), 0);
        done();
      });
    });
  });

  test("failure case", function (assert) {
    Ember.run(function () {
      var done = assert.async();
      var profile = make('profile');
      TestHelper.handleDelete('profile', profile.id, false);

      profile.destroyRecord().then(
        function () {
        },
        function () {
          ok(true);
          done();
        }
      );
    });
  });

};


export default SharedBehavior;