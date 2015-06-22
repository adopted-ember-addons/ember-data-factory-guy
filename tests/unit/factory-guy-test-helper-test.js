import Ember from 'ember';
import FactoryGuy, { make, makeList } from 'ember-data-factory-guy';
import TestHelper from 'ember-data-factory-guy/factory-guy-test-helper';
import MissingSequenceError from 'ember-data-factory-guy/missing-sequence-error';

import $ from 'jquery';
import User from 'dummy/models/user';
import BigHat from 'dummy/models/big-hat';
import SmallHat from 'dummy/models/small-hat';
import Outfit from 'dummy/models/outfit';
import Profile from 'dummy/models/profile';

import startApp from '../helpers/start-app';
import { theUsualSetup, theUsualTeardown } from '../helpers/utility-methods';

var App, store;

module('FactoryGuyTestHelper with DS.RESTAdapter', {
  teardown: function () {
    theUsualTeardown(App);
  }
});

test("#buildURL without namespace", function () {
  App = theUsualSetup('-rest');
  equal(TestHelper.buildURL('project'), '/projects', 'has no namespace by default');
});

test("#buildURL with namespace and host", function () {
  App = startApp();
  var restAdapter = App.__container__.lookup('adapter:-rest');
  store = FactoryGuy.getStore();
  store.adapterFor = function () {
    return restAdapter;
  };

  restAdapter.setProperties({
    host: 'https://dude.com',
    namespace: 'api/v1'
  });

  equal(TestHelper.buildURL('project'), 'https://dude.com/api/v1/projects');
});


module('FactoryGuyTestHelper with DS.RESTAdapter ', {
  setup: function () {
    App = theUsualSetup('-rest');
    store = FactoryGuy.getStore();
  },
  teardown: function () {
    theUsualTeardown(App);
  }
});

/////// handleCreate //////////

test("#handleCreate the basic", function (assert) {
  Ember.run(function () {
    var done = assert.async();
    var customDescription = "special description";

    TestHelper.handleCreate('profile', {
      match: {description: customDescription}
    });
    ok(store.all('profile').get('content.length') === 0);
    store.createRecord('profile', {
      description: customDescription
    }).save().then(function (profile) {
      ok(store.all('profile').get('content.length') === 1, 'No extra records created');
      ok(profile instanceof Profile, 'Creates the correct type of record');
      ok(profile.get('description') === customDescription, 'Passes along the match attributes');
      done();
    });
  });
});


/////// handleFindQuery //////////

test("#handleFindQuery second argument should be an array", function (assert) {
  assert.throws(function () {
    TestHelper.handleFindQuery('user', 'name', {});
  }, "second argument not correct type");
});

test("#handleFindQuery json payload argument should be an array", function (assert) {
  assert.throws(function () {
    TestHelper.handleFindQuery('user', ['name'], {});
  }, "payload argument is not an array");
});

test("#handleFindQuery passing in nothing as last argument returns no results", function (assert) {
  Ember.run(function () {
    var done = assert.async();
    TestHelper.handleFindQuery('user', ['name']);
    store.findQuery('user', {name: 'Bob'}).then(function (users) {
      equal(users.get('length'), 0);
      done();
    });
  });
});


test("#handleFindQuery passing in existing instances returns those and does not create new ones", function (assert) {
  Ember.run(function () {
    var done = assert.async();
    var users = FactoryGuy.makeList('user', 2, 'with_hats');
    TestHelper.handleFindQuery('user', ['name'], users);

    equal(store.all('user').get('content.length'), 2, 'start out with 2 instances');

    store.findQuery('user', {name: 'Bob'}).then(function (users) {
      equal(users.get('length'), 2);
      equal(users.get('firstObject.name'), 'User1');
      equal(users.get('firstObject.hats.length'), 2);
      equal(users.get('lastObject.name'), 'User2');
      equal(store.all('user').get('content.length'), 2, 'no new instances created');
      done();
    });
  });
});

test("#handleFindQuery passing in existing instances with hasMany and belongsTo", function (assert) {
  Ember.run(function () {
    var done = assert.async();
    var users = FactoryGuy.makeList('company', 2, 'with_projects', 'with_profile');
    TestHelper.handleFindQuery('company', ['name'], users);

    equal(store.all('company').get('content.length'), 2, 'start out with 2 instances');

    store.findQuery('company', {name: 'Dude'}).then(function (companies) {
      equal(companies.get('length'), 2);
      ok(companies.get('firstObject.profile') instanceof Profile);
      equal(companies.get('firstObject.projects.length'), 2);
      ok(companies.get('lastObject.profile') instanceof Profile);
      equal(companies.get('lastObject.projects.length'), 2);
      equal(store.all('company').get('content.length'), 2, 'no new instances created');
      done();
    });
  });
});


/////// handleFindAll //////////

test("#handleFindAll the basic", function (assert) {
  Ember.run(function () {
    var done = assert.async();
    TestHelper.handleFindAll('profile', 2);

    store.find('profile').then(function (profiles) {
      ok(profiles.get('length') === 2);
      done();
    });
  });
});

test("#handleFindAll with fixture options", function (assert) {
  Ember.run(function () {
    var done = assert.async();
    TestHelper.handleFindAll('profile', 2, {description: 'dude'});

    store.find('profile').then(function (profiles) {
      ok(profiles.get('length') === 2);
      ok(profiles.get('firstObject.description') === 'dude');
      done();
    });
  });
});

test("#handleFindAll with traits", function (assert) {
  var done = assert.async();
  TestHelper.handleFindAll('profile', 2, 'goofy_description');

  store.find('profile').then(function (profiles) {
    ok(profiles.get('length') === 2);
    ok(profiles.get('firstObject.description') === 'goofy');
    done();
  });
});

test("#handleFindAll with traits and extra options", function (assert) {
  var done = assert.async();
  TestHelper.handleFindAll('profile', 2, 'goofy_description', {description: 'dude'});

  store.find('profile').then(function (profiles) {
    ok(profiles.get('length') === 2);
    ok(profiles.get('firstObject.description') === 'dude');
    done();
  });
});


//////// handleFind /////////
test("#handleFind with a record handles reload, and does not change attributes", function (assert) {
  var done = assert.async();
  Ember.run(function () {
    var original_description = "whatever";
    var profile = FactoryGuy.make('profile', {description: original_description});
    TestHelper.handleFind(profile);

    profile.reload().then(function (profile2) {
      ok(profile2.id === profile.id);
      ok(profile2.get('description') === original_description);
      done();
    });
  });
});


test("#handleFind failure with andFail method", function (assert) {
  Ember.run(function () {
    var done = assert.async();
    TestHelper.handleFind('profile', 1).andFail();

    store.find('profile', 1).then(
      function (response) {},
      function (reason) {
        ok(true);
        done();
      }
    );
  });
});


module('FactoryGuyTestHelper with DS.ActiveModelAdapter', {
  setup: function () {
    App = theUsualSetup('-active-model');
    store = FactoryGuy.getStore();
  },
  teardown: function () {
    theUsualTeardown(App);
  }
});


/////// handleCreate //////////

/////// with hash of parameters ///////////////////
test("#handleCreate with no specific match", function (assert) {
  Ember.run(function () {
    var done = assert.async();
    TestHelper.handleCreate('profile');

    store.createRecord('profile', {description: 'whatever'}).save().then(function (profile) {
      ok(profile.id === '1');
      ok(profile.get('description') === 'whatever');
      done();
    });

  });
});

test("#handleCreate with no specific match creates many in a loop", function (assert) {
  Ember.run(function () {
    var done = assert.async();

    TestHelper.handleCreate('profile');

    var promises = [1,2,3].map(function() {
      return store.createRecord('profile', {description: 'whatever'}).save();
    });

    Ember.RSVP.all(promises).then(function (profiles) {
      var ids = profiles.map(function(profile) {return profile.get('id');});
      var descriptions = profiles.map(function(profile) {return profile.get('description');});
      ok(ids+'' === [1,2,3]+'');
      ok(descriptions+'' === ['whatever', 'whatever', 'whatever']+'');
      done();
    });
  });
});

test("#handleCreate match some attributes", function (assert) {
  Ember.run(function () {
    var done = assert.async();
    var customDescription = "special description";
    var date = new Date();

    TestHelper.handleCreate('profile', { match: {description: customDescription} });

    store.createRecord('profile', {
      description: customDescription, created_at: date
    }).save().then(function (profile) {
      ok(profile instanceof Profile);
      ok(profile.id === '1');
      ok(profile.get('description') === customDescription);
      done();
    });
  });
});

test("#handleCreate match all attributes", function (assert) {
  Ember.run(function () {
    var done = assert.async();
    var customDescription = "special description";
    var date = new Date();

    TestHelper.handleCreate('profile', {
      match: {description: customDescription, created_at: date}
    });

    store.createRecord('profile', {
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


test("#handleCreate returns attributes", function (assert) {
  Ember.run(function () {
    var done = assert.async();
    var date = new Date();

    TestHelper.handleCreate('profile', {
      returns: {created_at: date}
    });

    store.createRecord('profile').save().then(function (profile) {
      ok(profile.get('created_at').toString() === date.toString());
      done();
    });
  });
});

test("#handleCreate returns camelCase attributes", function (assert) {
  Ember.run(function () {
    var done = assert.async();
    var customDescription = "special description";

    TestHelper.handleCreate('profile', {
      returns: {camel_case_description: customDescription}
    });

    store.createRecord('profile', {
      camel_case_description: 'description'
    }).save().then(function (profile) {
      ok(profile.get('camelCaseDescription') === customDescription);
      done();
    });
  });
});

test("#handleCreate match belongsTo association", function (assert) {
  Ember.run(function () {
    var done = assert.async();
    var company = make('company');
    TestHelper.handleCreate('profile', {match: {company: company}});

    store.createRecord('profile', {company: company}).save().then(function (profile) {
      ok(profile.get('company') === company);
      done();
    });
  });
});

test("#handleCreate match belongsTo polymorphic association", function (assert) {
  Ember.run(function () {
    var done = assert.async();
    var group = make('group');
    TestHelper.handleCreate('profile', {match: {group: group}});

    store.createRecord('profile', {group: group}).save().then(function (profile) {
      ok(profile.get('group') === group);
      done();
    });
  });
});


test("#handleCreate match attributes and return attributes", function (assert) {
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

    store.createRecord('profile', {
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


test("#handleCreate failure", function (assert) {
  Ember.run(function () {
    var done = assert.async();
    TestHelper.handleCreate('profile', {succeed: false});

    store.createRecord('profile').save()
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

test("#handleCreate failure with status code 422 and errors in response", function (assert) {
  Ember.run(function () {
    var done = assert.async();
    TestHelper.handleCreate('profile', {succeed: false, status: 422, response: {errors: {description: ['bad']}}});

    var profile = store.createRecord('profile');
    profile.save()
      .then(
        function () {},
        function () {
          var errors = profile.get('errors').errorsFor('description')[0];
          equal(errors.attribute, 'description');
          equal(errors.message, 'bad');
          done();
        }
      );
  });
});


test("#handleCreate match but still fail", function (assert) {
  Ember.run(function () {
    var done = assert.async();
    var description = "special description";

    TestHelper.handleCreate('profile', {
      match: {description: description}, succeed: false
    });

    store.createRecord('profile', {description: description}).save()
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

test("#handleCreate fails when match args not present in createRecord attributes", function (assert) {
  Ember.run(function () {
    var done = assert.async();
    var customDescription = "special description";
    var date = new Date();

    TestHelper.handleCreate('profile', {match: {description: customDescription}});

    store.createRecord('profile', {description: 'wrong description'}).save().then(
      function () {},
      function () {
        ok(true);
        done();
      });
  });
});


/////// handleCreate //////////
/////// with chaining methods ///////////////////

test("#handleCreate match some attributes with match method", function (assert) {
  Ember.run(function () {
    var done = assert.async();
    var customDescription = "special description";
    var date = new Date();

    TestHelper.handleCreate('profile').match({description: customDescription});

    store.createRecord('profile', {
      description: customDescription, created_at: date
    }).save().then(function (profile) {
      ok(profile instanceof Profile);
      ok(profile.id === '1');
      ok(profile.get('description') === customDescription);
      done();
    });
  });
});

test("#handleCreate match all attributes with match method", function (assert) {
  Ember.run(function () {
    var done = assert.async();
    var customDescription = "special description";
    var date = new Date();

    TestHelper.handleCreate('profile').match({description: customDescription, created_at: date});

    store.createRecord('profile', {
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

test("#handleCreate match belongsTo association with match method", function (assert) {
  Ember.run(function () {
    var done = assert.async();
    var company = make('company');

    TestHelper.handleCreate('profile').match({company: company});

    store.createRecord('profile', {company: company}).save().then(function (profile) {
      ok(profile.get('company') === company);
      done();
    });
  });
});

test("#handleCreate match belongsTo polymorphic association  with match method", function (assert) {
  Ember.run(function () {
    var done = assert.async();
    var group = make('group');
    TestHelper.handleCreate('profile').match({group: group});

    store.createRecord('profile', {group: group}).save().then(function (profile) {
      ok(profile.get('group') === group);
      done();
    });
  });
});


test("#handleCreate returns attributes with andReturns method", function (assert) {
  Ember.run(function () {
    var done = assert.async();
    var date = new Date();

    TestHelper.handleCreate('profile').andReturn({created_at: date});

    store.createRecord('profile').save().then(function (profile) {
      ok(profile.get('created_at').toString() === date.toString());
      done();
    });
  });
});

test("#handleCreate match attributes and return attributes with match and andReturn methods", function (assert) {
  Ember.run(function () {
    var done = assert.async();
    var date = new Date();
    var customDescription = "special description";
    var company = make('company');
    var group = make('big-group');

    TestHelper.handleCreate('profile')
      .match({description: customDescription, company: company, group: group})
      .andReturn({created_at: new Date()});

    store.createRecord('profile', {
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


test("#handleCreate failure with andFail method", function (assert) {
  Ember.run(function () {
    var done = assert.async();
    TestHelper.handleCreate('profile').andFail();

    store.createRecord('profile').save()
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


test("#handleCreate match but still fail with andFail method", function (assert) {
  Ember.run(function () {
    var done = assert.async();
    var description = "special description";

    TestHelper.handleCreate('profile').match({description: description}).andFail();

    store.createRecord('profile', {description: description}).save()
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

test("#handleCreate failure with status code 422 and errors in response with andFail method", function (assert) {
  Ember.run(function () {
    var done = assert.async();
    TestHelper.handleCreate('profile').andFail({status: 422, response: {errors: {description: ['bad']}}});

    var profile = store.createRecord('profile');
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


/////// handleFindAll //////////

test("#handleFindMany aliases handleFindAll", function (assert) {
  var done = assert.async();
  TestHelper.handleFindMany('profile', 2);

  store.find('profile').then(function (profiles) {
    ok(profiles.get('length') === 2);
    ok(profiles.get('firstObject.description') === 'Text goes here');
    done();
  });
});

test("#handleFindAll the basic", function (assert) {
  Ember.run(function () {
    var done = assert.async();
    TestHelper.handleFindAll('profile', 2);

    store.find('profile').then(function (profiles) {
      ok(profiles.get('length') === 2);
      ok(profiles.get('firstObject.description') === 'Text goes here');
      done();
    });
  });
});

test("#handleFindAll with fixture options", function (assert) {
  Ember.run(function () {
    var done = assert.async();
    TestHelper.handleFindAll('profile', 2, {description: 'dude'});

    store.find('profile').then(function (profiles) {
      ok(profiles.get('length') === 2);
      ok(profiles.get('firstObject.description') === 'dude');
      done();
    });
  });
});

test("#handleFindAll with traits", function (assert) {
  Ember.run(function () {
    var done = assert.async();
    TestHelper.handleFindAll('profile', 2, 'goofy_description');

    store.find('profile').then(function (profiles) {
      ok(profiles.get('length') === 2);
      ok(profiles.get('firstObject.description') === 'goofy');
      done();
    });
  });
});

test("#handleFindAll with traits and fixture options", function (assert) {
  Ember.run(function () {
    var done = assert.async();
    TestHelper.handleFindAll('profile', 2, 'goofy_description', {description: 'dude'});

    store.find('profile').then(function (profiles) {
      ok(profiles.get('length') === 2);
      ok(profiles.get('firstObject.description') === 'dude');
      done();
    });
  });
});


/////// handleUpdate //////////

test("#handleUpdate with incorrect parameters", function (assert) {
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

test("#handleUpdate with modelType and id", function (assert) {
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


test("#handleUpdate with model", function (assert) {
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

test("#handleUpdate the with model that has polymorphic belongsTo", function (assert) {
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

test("#handleUpdate the with modelType and id that fails", function (assert) {
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

test("#handleUpdate with model that fails", function (assert) {
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

test("#handleUpdate with model that fails with custom response", function (assert) {
  Ember.run(function () {
    var done = assert.async();
    var profile = make('profile');

    TestHelper.handleUpdate(profile, {succeed: false, status: 400, response: 'invalid data'});

    profile.set('description', 'new desc');
    profile.save().then(
      function () {
      },
      function (reason) {
        var error = reason.errors[0];
        equal(error.status, "400");
        equal(error.details, "invalid data");
        done();
      }
    );
  });
});

test("#handleUpdate with modelType and id that fails chained", function (assert) {
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

test("#handleUpdate with model that fails chained", function (assert) {
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

test("#handleUpdate with model that fails with custom response", function (assert) {
  var done = assert.async();
  Ember.run(function () {
    var profile = make('profile');

    TestHelper.handleUpdate(profile).andFail({
      status: 400,
      response: "invalid data"
    });

    profile.set('description', 'new desc');
    profile.save().then(
      function () {
      },
      function (reason) {
        var error = reason.errors[0];
        equal(error.status, "400");
        equal(error.details, "invalid data");
        done();
      }
    );
  });
});

test("#handleUpdate with model that fails and then succeeds", function (assert) {
  Ember.run(function () {
    var done = assert.async();
    var profile = make('profile');

    var updateMock = TestHelper.handleUpdate(profile).andFail({
      status: 400,
      response: "invalid data"
    });

    profile.set('description', 'new desc');
    profile.save().then(
      function () {
      },
      function (reason) {
        var error = reason.errors[0];
        equal(error.details, "invalid data", "Could not save model.");
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

/////// handleDelete //////////

test("#handleDelete the basic", function (assert) {
  Ember.run(function () {
    var done = assert.async();
    var profile = make('profile');
    TestHelper.handleDelete('profile', profile.id);

    profile.destroyRecord().then(function () {
      equal(store.all('profile').get('content.length'), 0);
      done();
    });
  });
});

test("#handleDelete failure case", function (assert) {
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
