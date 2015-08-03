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
    var adapter = FactoryGuy.getStore().adapterFor('application');
    adapter.setProperties({
      host: 'https://dude.com',
      namespace: 'api/v1'
    });

    equal(TestHelper.buildURL('project'), 'https://dude.com/api/v1/projects');
  });

};

//////// handleFind /////////
SharedBehavior.handleFindTests = function () {

  test("#handleFind the basic returns id", function (assert) {
    Ember.run(function () {
      var done = assert.async();
      var profileId = TestHelper.handleFind('profile');

      FactoryGuy.getStore().find('profile', profileId).then(function (profile) {
        equal(profile.get('id'), profileId);
        equal(profile.get('description'), 'Text goes here');
        done();
      });
    });
  });

  test("#handleFind with fixture options", function (assert) {
    Ember.run(function () {
      var done = assert.async();
      var profileId = TestHelper.handleFind('profile', {description: 'dude'});

      FactoryGuy.getStore().find('profile', profileId).then(function (profile) {
        ok(profile.get('description') === 'dude');
        done();
      });
    });
  });

  test("#handleFind with traits", function (assert) {
    Ember.run(function () {
      var done = assert.async();
      var profileId = TestHelper.handleFind('profile', 'goofy_description');

      FactoryGuy.getStore().find('profile', profileId).then(function (profile) {
        ok(profile.get('description') === 'goofy');
        done();
      });
    });
  });

  test("#handleFind with traits and extra options", function (assert) {
    Ember.run(function () {
      var done = assert.async();
      var profileId = TestHelper.handleFind('profile', 'goofy_description', {description: 'dude'});

      FactoryGuy.getStore().find('profile', profileId).then(function (profile) {
        ok(profile.get('description') === 'dude');
        done();
      });
    });
  });


  // TODO: need to modify convert for active model serializer to sideload relationships
  //test("#handleFind with belongsTo association", function (assert) {
  //  Ember.run(function () {
  //    var done = assert.async();
  //    var profileId = TestHelper.handleFind('profile', 'with_company');
  //
  //    FactoryGuy.getStore().find('profile', profileId).then(function (profile) {
  //      console.log('profileId=>', profile._internalModel._data)
  //      console.log('profile desc', profile.get('company'))
  //      ok(profile.get('company.name') === 'Silly corp');
  //      done();
  //    });
  //  });
  //});

  //test("#handleFind with hasMany association", function (assert) {
  //  var done = assert.async();
  //  TestHelper.handleFind('profile', 2, 'goofy_description', {description: 'dude'});
  //
  //  FactoryGuy.getStore().find('profile').then(function (profile) {
  //    ok(profile.get('length') === 2);
  //    ok(profile.get('description') === 'dude');
  //    done();
  //  });
  //});
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

      FactoryGuy.getStore().find('profile', 1).then(
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

      FactoryGuy.getStore().findAll('user').then(function (profiles) {
        ok(profiles.get('length') === 2);
        done();
      });
    });
  });

  test("handles camelCase attributes", function (assert) {
    Ember.run(function () {
      var done = assert.async();

      TestHelper.handleFindAll('profile', 1);

      FactoryGuy.getStore().findAll('profile').then(function (profiles) {
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

      FactoryGuy.getStore().findAll('user').then(function (profiles) {
        ok(profiles.get('length') === 0);
        done();
      });
    });
  });

  test("with fixture options", function (assert) {
    Ember.run(function () {
      var done = assert.async();
      TestHelper.handleFindAll('profile', 2, {description: 'dude'});

      FactoryGuy.getStore().findAll('profile').then(function (profiles) {
        ok(profiles.get('length') === 2);
        ok(profiles.get('firstObject.description') === 'dude');
        done();
      });
    });
  });

  test("with traits", function (assert) {
    var done = assert.async();
    TestHelper.handleFindAll('profile', 2, 'goofy_description');

    FactoryGuy.getStore().findAll('profile').then(function (profiles) {
      ok(profiles.get('length') === 2);
      ok(profiles.get('firstObject.description') === 'goofy');
      done();
    });
  });

  test("with traits and extra options", function (assert) {
    var done = assert.async();
    TestHelper.handleFindAll('profile', 2, 'goofy_description', {description: 'dude'});

    FactoryGuy.getStore().findAll('profile').then(function (profiles) {
      ok(profiles.get('length') === 2);
      ok(profiles.get('firstObject.description') === 'dude');
      done();
    });
  });

};


/////// handleFindQuery //////////

SharedBehavior.handleFindQueryTests = function () {

  test("second argument should be an array", function (assert) {
    assert.throws(function () {
      TestHelper.handleFindQuery('user', 'name', {});
    }, "second argument not correct type");
  });

  test("json payload argument should be an array", function (assert) {
    assert.throws(function () {
      TestHelper.handleFindQuery('user', ['name'], {});
    }, "payload argument is not an array");
  });

  test("passing in nothing as last argument returns no results", function (assert) {
    Ember.run(function () {
      var done = assert.async();
      TestHelper.handleFindQuery('user', ['name']);
      FactoryGuy.getStore().query('user', {name: 'Bob'}).then(function (users) {
        equal(users.get('length'), 0);
        done();
      });
    });
  });


  test("passing in existing instances returns those and does not create new ones", function (assert) {
    Ember.run(function () {
      var done = assert.async();
      var users = FactoryGuy.makeList('user', 2, 'with_hats');
      TestHelper.handleFindQuery('user', ['name'], users);

      equal(FactoryGuy.getStore().peekAll('user').get('content.length'), 2, 'start out with 2 instances');

      FactoryGuy.getStore().query('user', {name: 'Bob'}).then(function (users) {
        equal(users.get('length'), 2);
        equal(users.get('firstObject.name'), 'User1');
        equal(users.get('firstObject.hats.length'), 2);
        equal(users.get('lastObject.name'), 'User2');
        equal(FactoryGuy.getStore().peekAll('user').get('content.length'), 2, 'no new instances created');
        done();
      });
    });
  });

  test("passing in existing instances with hasMany and belongsTo", function (assert) {
    Ember.run(function () {
      var done = assert.async();
      var users = FactoryGuy.makeList('company', 2, 'with_projects', 'with_profile');
      TestHelper.handleFindQuery('company', ['name'], users);

      equal(FactoryGuy.getStore().peekAll('company').get('content.length'), 2, 'start out with 2 instances');

      FactoryGuy.getStore().query('company', {name: 'Dude'}).then(function (companies) {
        equal(companies.get('length'), 2);
        ok(companies.get('firstObject.profile') instanceof Profile);
        equal(companies.get('firstObject.projects.length'), 2);
        ok(companies.get('lastObject.profile') instanceof Profile);
        equal(companies.get('lastObject.projects.length'), 2);
        equal(FactoryGuy.getStore().peekAll('company').get('content.length'), 2, 'no new instances created');
        done();
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
      ok(FactoryGuy.getStore().peekAll('profile').get('content.length') === 0);
      FactoryGuy.getStore().createRecord('profile', {
        description: customDescription
      }).save().then(function (profile) {
        ok(FactoryGuy.getStore().peekAll('profile').get('content.length') === 1, 'No extra records created');
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

      FactoryGuy.getStore().createRecord('profile', {description: 'whatever'}).save().then(function (profile) {
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
        return FactoryGuy.getStore().createRecord('profile', {description: 'whatever'}).save();
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

      FactoryGuy.getStore().createRecord('profile', {
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

      FactoryGuy.getStore().createRecord('profile', {
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

      FactoryGuy.getStore().createRecord('profile').save().then(function (profile) {
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

      FactoryGuy.getStore().createRecord('profile', {company: company}).save().then(function (profile) {
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

      FactoryGuy.getStore().createRecord('profile', {group: group}).save().then(function (profile) {
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

      FactoryGuy.getStore().createRecord('profile', {
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

      FactoryGuy.getStore().createRecord('profile').save()
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
      TestHelper.handleCreate('profile', {succeed: false, status: 422, response: {errors: {description: ['bad']}}});

      var profile = FactoryGuy.getStore().createRecord('profile');
      profile.save()
        .then(
        function () {
        },
        function () {
          var errors = profile.get('errors').errorsFor('description')[0];
          equal(errors.attribute, 'description');
          equal(errors.message, 'bad');
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

      FactoryGuy.getStore().createRecord('profile', {description: description}).save()
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

      FactoryGuy.getStore().createRecord('profile', {description: 'wrong description'}).save().then(
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

      FactoryGuy.getStore().createRecord('profile', {
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

      FactoryGuy.getStore().createRecord('profile', {
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

      FactoryGuy.getStore().createRecord('profile', {company: company}).save().then(function (profile) {
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

      FactoryGuy.getStore().createRecord('profile', {group: group}).save().then(function (profile) {
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

      FactoryGuy.getStore().createRecord('profile').save().then(function (profile) {
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

      FactoryGuy.getStore().createRecord('profile').save().then(function (profile) {
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

      FactoryGuy.getStore().createRecord('profile', {
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

      FactoryGuy.getStore().createRecord('profile').save()
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

      FactoryGuy.getStore().createRecord('profile', {description: description}).save()
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
      TestHelper.handleCreate('profile').andFail({status: 422, response: {errors: {description: ['bad']}}});
      // TODO Need to change the errors for json api style for that adapter
      //TestHelper.handleCreate('profile').andFail({status: 422, response: {errors: [{detail: 'bad', source: { pointer:  "data/attributes/description"}, title: 'invalid description'}] } });

      var profile = FactoryGuy.getStore().createRecord('profile');
      profile.save()
        .then(
        function () {
        },
        function () {
          var errors = profile.get('errors').errorsFor('description')[0];
          equal(errors.attribute, 'description');
          equal(errors.message, 'bad');
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
        equal(FactoryGuy.getStore().peekAll('profile').get('content.length'), 0);
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