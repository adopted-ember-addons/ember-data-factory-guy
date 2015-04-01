var testHelper, store, make;

module('FactoryGuyTestMixin with DS.RESTAdapter', {});

test("#buildURL without namespace", function () {
  RestAdapter = DS.RESTAdapter.extend({
    host: '',
    namespace: ''
  });
  testHelper = TestHelper.setup(RestAdapter);

  equal(testHelper.buildURL('project'), '/projects', 'has no namespace by default');
})

test("#buildURL with namespace and host", function () {
  RestAdapter = DS.RESTAdapter.extend({
    host: 'https://dude.com',
    namespace: 'api/v1'
  });
  testHelper = TestHelper.setup(RestAdapter);

  equal(testHelper.buildURL('project'), 'https://dude.com/api/v1/projects');
})



module('FactoryGuyTestMixin (using mockjax) with DS.RESTAdapter', {
  setup: function () {
    testHelper = TestHelper.setup(DS.RESTAdapter);
    store = testHelper.getStore();
    make = function() {return FactoryGuy.make.apply(FactoryGuy,arguments);}
  },
  teardown: function () {
    Em.run(function() {
      testHelper.teardown();
    });
  }
});

/////// handleCreate //////////

asyncTest("#handleCreate the basic", function() {
  Em.run(function() {
    var customDescription = "special description"

    testHelper.handleCreate('profile', {
      match: {description: customDescription}
    })
    ok(store.all('profile').get('content.length') == 0)
    store.createRecord('profile', {
      description: customDescription
    }).save().then(function(profile) {
      ok(store.all('profile').get('content.length') == 1, 'No extra records created')
      ok(profile instanceof Profile, 'Creates the correct type of record')
      ok(profile.get('description') == customDescription, 'Passes along the match attributes')
      start();
    });
  });
});


/////// handleFindQuery //////////

test("#handleFindQuery second argument should be an array", function(assert) {
  assert.throws(function(){testHelper.handleFindQuery('user', 'name', {})},"second argument not correct type");
});

test("#handleFindQuery json payload argument should be an array", function(assert) {
  assert.throws(function(){testHelper.handleFindQuery('user', ['name'], {})},"payload argument is not an array");
});

asyncTest("#handleFindQuery passing in nothing as last argument returns no results", function() {
  testHelper.handleFindQuery('user', ['name']);
  store.findQuery('user', {name: 'Bob'}).then(function (users) {
    equal(users.get('length'),0)
    start()
  });
})


asyncTest("#handleFindQuery passing in existing instances returns those and does not create new ones", function() {
  var users = FactoryGuy.makeList('user', 2, 'with_hats');
  testHelper.handleFindQuery('user', ['name'], users);

  equal(store.all('user').get('content.length'), 2, 'start out with 2 instances')

  store.findQuery('user', {name: 'Bob'}).then(function (users) {
    equal(users.get('length'), 2)
    equal(users.get('firstObject.name'), 'User1')
    equal(users.get('firstObject.hats.length'), 2)
    equal(users.get('lastObject.name'), 'User2')
    equal(store.all('user').get('content.length'), 2, 'no new instances created')
    start();
  })
});

asyncTest("#handleFindQuery passing in existing instances with hasMany and belongsTo", function() {
  var users = FactoryGuy.makeList('company', 2, 'with_projects', 'with_profile');
  testHelper.handleFindQuery('company', ['name'], users);

  equal(store.all('company').get('content.length'), 2, 'start out with 2 instances')

  store.findQuery('company', {name: 'Dude'}).then(function (companies) {
    equal(companies.get('length'), 2)
    ok(companies.get('firstObject.profile') instanceof Profile)
    equal(companies.get('firstObject.projects.length'), 2)
    ok(companies.get('lastObject.profile') instanceof Profile)
    equal(companies.get('lastObject.projects.length'), 2)
    equal(store.all('company').get('content.length'), 2, 'no new instances created')
    start();
  })
});


/////// handleFindAll //////////

asyncTest("#handleFindAll the basic", function () {
  testHelper.handleFindAll('profile', 2);

  store.findAll('profile').then(function (profiles) {
    ok(profiles.get('length') == 2);
    start();
  });
});

asyncTest("#handleFindAll with fixture options", function () {
  testHelper.handleFindAll('profile', 2, {description: 'dude'});

  store.findAll('profile').then(function (profiles) {
    ok(profiles.get('length') == 2);
    ok(profiles.get('firstObject.description') == 'dude');
    start();
  });
});

asyncTest("#handleFindAll with traits", function () {
  testHelper.handleFindAll('profile', 2, 'goofy_description');

  store.findAll('profile').then(function (profiles) {
    ok(profiles.get('length') == 2);
    ok(profiles.get('firstObject.description') == 'goofy');
    start();
  });
});

asyncTest("#handleFindAll with traits and extra options", function () {
  testHelper.handleFindAll('profile', 2, 'goofy_description', {description: 'dude'});

  store.findAll('profile').then(function (profiles) {
    ok(profiles.get('length') == 2);
    ok(profiles.get('firstObject.description') == 'dude');
    start();
  });
});


//////// handleFind /////////

asyncTest("#handleFindOne aliases handleFind", function () {
  var id = 1
  testHelper.handleFindOne('profile', {id: id});

  store.find('profile', 1).then(function (profile) {
    ok(profile.get('id') == id);
    start();
  });

});

asyncTest("#handleFind with a record returns the record", function () {
  var profile = FactoryGuy.make('profile')
  testHelper.handleFind(profile);

  store.find('profile', 1).then(function (profile2) {
    ok(profile2.id == profile.id);
    start();
  });

});

asyncTest("#handleFind with a record handles reload", function () {
  Em.run(function() {
    var profile = FactoryGuy.make('profile')
    testHelper.handleFind(profile);

    profile.reload().then(function (profile2) {
      ok(profile2.id == profile.id);
      start();
    });
  });
});

asyncTest("#handleFind with options", function () {
  var id = 1
  testHelper.handleFind('profile', {id: id});

  store.find('profile', 1).then(function (profile) {
    ok(profile.get('id') == id);
    start();
  });

});

asyncTest("#handleFind with traits", function () {
  var id = 1
  testHelper.handleFind('profile', 'goofy_description', {id: id});

  store.find('profile', 1).then(function (profile) {
    ok(profile.get('description') == 'goofy');
    start();
  });
});

asyncTest("#handleFind with arguments", function () {
  var id = 1
  var description = 'guy';
  testHelper.handleFind('profile', {id: id, description: description });

  store.find('profile', 1).then(function (profile) {
    ok(profile.get('description') == description);
    start();
  });
});

asyncTest("#handleFind with traits and arguments", function () {
  var id = 1
  var description = 'guy';
  testHelper.handleFind('profile', 'goofy_description', {id: id, description: description});

  store.find('profile', 1).then(function (profile) {
    ok(profile.get('description') == description);
    start();
  });
})



module('FactoryGuyTestMixin (using mockjax) with DS.ActiveModelAdapter', {
  setup: function () {
    testHelper = TestHelper.setup(DS.ActiveModelAdapter);
    store = testHelper.getStore();
    make = function() {return FactoryGuy.make.apply(FactoryGuy,arguments)}
  },
  teardown: function () {
    Em.run(function() {
      testHelper.teardown();
    });
  }
});


  /////// handleCreate //////////

/////// with hash of parameters ///////////////////
asyncTest("#handleCreate with no specific match", function() {
  Em.run(function() {
    testHelper.handleCreate('profile');

    store.createRecord('profile', {description: 'whatever'}).save().then(function(profile) {
      ok(profile.id == 1)
      ok(profile.get('description') == 'whatever')
      start();
    });
  });
});

asyncTest("#handleCreate match some attributes", function() {
  Em.run(function() {
    var customDescription = "special description"
    var date = new Date();

    testHelper.handleCreate('profile', {
      match: {description: customDescription}
    })

    store.createRecord('profile', {
      description: customDescription, created_at: date
    }).save().then(function (profile) {
      ok(profile instanceof Profile)
      ok(profile.id == 1)
      ok(profile.get('description') == customDescription)
      start();
    });
  })
});

asyncTest("#handleCreate match all attributes", function() {
  Em.run(function() {
    var customDescription = "special description"
    var date = new Date();

    testHelper.handleCreate('profile', {
      match: {description: customDescription, created_at: date}
    })

    store.createRecord('profile', {
      description: customDescription, created_at: date
    }).save().then(function(profile) {
      ok(profile instanceof Profile)
      ok(profile.id == 1)
      ok(profile.get('description') == customDescription)
      ok(profile.get('created_at') == date.toString())
      start();
    });
  });
});


asyncTest("#handleCreate returns attributes", function() {
  Em.run(function() {
    var date = new Date()

    testHelper.handleCreate('profile', {
      returns: {created_at: date}
    })

    store.createRecord('profile').save().then(function(profile) {
      ok(profile.get('created_at') == date.toString())
      start();
    });
  });
});

asyncTest("#handleCreate returns camelCase attributes", function() {
  Em.run(function() {
    var customDescription = "special description"

    testHelper.handleCreate('profile', {
      returns: {camel_case_description: customDescription}
    })

    store.createRecord('profile', {
      camel_case_description: 'description'
    }).save().then(function(profile) {
      ok(profile.get('camelCaseDescription') == customDescription)
      start();
    });
  });
});

asyncTest("#handleCreate match belongsTo association", function() {
  Em.run(function() {
    var company = make('company')
    testHelper.handleCreate('profile', {match:{ company: company}})

    store.createRecord('profile', {company: company}).save().then(function(profile) {
      ok(profile.get('company') == company)
      start();
    });
  });
});

asyncTest("#handleCreate match belongsTo polymorphic association", function() {
  Em.run(function() {
    var group = make('group')
    testHelper.handleCreate('profile', {match:{ group: group}})

    store.createRecord('profile', {group: group}).save().then(function(profile) {
      ok(profile.get('group') == group)
      start();
    });
  });
});


asyncTest("#handleCreate match attributes and return attributes", function() {
  Em.run(function() {
    var date = new Date()
    var customDescription = "special description"
    var company = make('company')
    var group = make('big_group')

    testHelper.handleCreate('profile', {
      match: {description: customDescription, company: company, group: group},
      returns: {created_at: new Date()}
    })

    store.createRecord('profile', {
      description: customDescription, company: company, group: group
    }).save().then(function(profile) {
      start();
      ok(profile.get('created_at') == date.toString())
      ok(profile.get('group') == group)
      ok(profile.get('company') == company)
      ok(profile.get('description') == customDescription)
    });
  });
});


asyncTest("#handleCreate failure", function() {
  Em.run(function() {
    testHelper.handleCreate('profile', { succeed: false } )

    store.createRecord('profile').save()
      .then(
        function() {},
        function() {
          ok(true)
          start();
        }
      )
  });
});

asyncTest("#handleCreate failure with status code 422 and errors in response", function() {
  Em.run(function() {
    testHelper.handleCreate('profile', {succeed: false, status: 422, response: {errors: {description: ['bad']}} } )

    store.createRecord('profile').save()
      .then(
        function() {},
        function(reason) {
          equal(reason.errors.description, ['bad']+'');
          ok(true)
          start();
        }
      )
  });
});


asyncTest("#handleCreate match but still fail", function() {
  Em.run(function() {
    var description = "special description"

    testHelper.handleCreate('profile', {
      match: {description: description}, succeed: false
    })

    store.createRecord('profile', {description: description}).save()
      .then(
        function() {},
        function() {
          ok(true)
          start();
        }
      )
  });
});

/////// handleCreate //////////
/////// with chaining methods ///////////////////

asyncTest("#handleCreate match some attributes with match method", function() {
  Em.run(function() {
    var customDescription = "special description"
    var date = new Date();

    testHelper.handleCreate('profile').match({description: customDescription});

    store.createRecord('profile', {
      description: customDescription, created_at: date
    }).save().then(function(profile) {
      ok(profile instanceof Profile)
      ok(profile.id == 1)
      ok(profile.get('description') == customDescription)
      start();
    });
  });
});

asyncTest("#handleCreate match all attributes  with match method", function() {
  Em.run(function() {
    var customDescription = "special description"
    var date = new Date();

    testHelper.handleCreate('profile').match({description: customDescription, created_at: date});

    store.createRecord('profile', {
      description: customDescription, created_at: date
    }).save().then(function(profile) {
      ok(profile instanceof Profile)
      ok(profile.id == 1)
      ok(profile.get('description') == customDescription)
      ok(profile.get('created_at') == date.toString())
      start();
    });
  });
});

asyncTest("#handleCreate match belongsTo association with match method", function() {
  Em.run(function() {
    var company = make('company')

    testHelper.handleCreate('profile').match({company: company})

    store.createRecord('profile', {company: company}).save().then(function(profile) {
      ok(profile.get('company') == company)
      start();
    });
  });
});

asyncTest("#handleCreate match belongsTo polymorphic association  with match method", function() {
  Em.run(function() {
    var group = make('group')
    testHelper.handleCreate('profile').match({group: group})

    store.createRecord('profile', {group: group}).save().then(function(profile) {
      ok(profile.get('group') == group)
      start();
    });
  });
});



asyncTest("#handleCreate returns attributes with andReturns method", function() {
  Em.run(function() {
    var date = new Date()

    testHelper.handleCreate('profile').andReturn({created_at: date});

    store.createRecord('profile').save().then(function(profile) {
      ok(profile.get('created_at') == date.toString())
      start();
    });
  });
});

asyncTest("#handleCreate match attributes and return attributes with match and andReturn methods", function() {
  Em.run(function() {
    var date = new Date()
    var customDescription = "special description"
    var company = make('company')
    var group = make('big_group')

    testHelper.handleCreate('profile')
      .match({description: customDescription, company: company, group: group})
      .andReturn({created_at: new Date()})

    store.createRecord('profile', {
      description: customDescription, company: company, group: group
    }).save().then(function(profile) {
      start();
      ok(profile.get('created_at') == date.toString())
      ok(profile.get('group') == group)
      ok(profile.get('company') == company)
      ok(profile.get('description') == customDescription)
    });
  });
});


asyncTest("#handleCreate failure with andFail method", function() {
  Em.run(function() {
    testHelper.handleCreate('profile').andFail();

    store.createRecord('profile').save()
      .then(
        function() {},
        function() {
          ok(true)
          start();
        }
      )
  });
});


asyncTest("#handleCreate match but still fail with andFail method", function() {
  Em.run(function() {
    var description = "special description"

    testHelper.handleCreate('profile').match({description: description}).andFail();

    store.createRecord('profile', {description: description}).save()
      .then(
        function() {},
        function() {
          ok(true)
          start();
        }
      )
  });
});

asyncTest("#handleCreate failure with status code 422 and errors in response with andFail method", function() {
  Em.run(function() {
    testHelper.handleCreate('profile').andFail({status: 422, response: {errors: {description: ['bad']}}});

    store.createRecord('profile').save()
      .then(
        function() {},
        function(reason) {
          equal(reason.errors.description, ['bad']+'');
          ok(true)
          start();
        }
      )
  });
});



/////// handleFindAll //////////

asyncTest("#handleFindMany aliases handleFindAll", function () {
  testHelper.handleFindMany('profile', 2);

  store.find('profile').then(function (profiles) {
    ok(profiles.get('length') == 2);
    ok(profiles.get('firstObject.description') == 'Text goes here');
    start();
  });
})

asyncTest("#handleFindAll the basic", function () {
  testHelper.handleFindAll('profile', 2);

  store.find('profile').then(function (profiles) {
    ok(profiles.get('length') == 2);
    ok(profiles.get('firstObject.description') == 'Text goes here');
    start();
  });
});

asyncTest("#handleFindAll with fixture options", function () {
  testHelper.handleFindAll('profile', 2, {description: 'dude'});

  store.find('profile').then(function (profiles) {
    ok(profiles.get('length') == 2);
    ok(profiles.get('firstObject.description') == 'dude');
    start();
  });
});

asyncTest("#handleFindAll with traits", function () {
  testHelper.handleFindAll('profile', 2, 'goofy_description');

  store.find('profile').then(function (profiles) {
    ok(profiles.get('length') == 2);
    ok(profiles.get('firstObject.description') == 'goofy');
    start();
  });
});

asyncTest("#handleFindAll with traits and fixture options", function () {
  testHelper.handleFindAll('profile', 2, 'goofy_description', {description: 'dude'});

  store.find('profile').then(function (profiles) {
    ok(profiles.get('length') == 2);
    ok(profiles.get('firstObject.description') == 'dude');
    start();
  });
});



/////// handleUpdate //////////

test("#handleUpdate with incorrect parameters", function(assert) {
  assert.throws(function(){testHelper.handleUpdate()},"missing everything");
  assert.throws(function(){testHelper.handleUpdate('profile')},"missing id");
  assert.throws(function(){testHelper.handleUpdate('profile', {})},"missing id");
});

asyncTest("#handleUpdate the with modelType and id", function () {
  Em.run(function () {
    var profile = make('profile');
    testHelper.handleUpdate('profile', profile.id);

    profile.set('description', 'new desc');
    profile.save().then(function (profile) {
      ok(profile.get('description') == 'new desc');
      start();
    });
  });
});


asyncTest("#handleUpdate the with model", function () {
  Em.run(function () {
    var profile = make('profile');
    testHelper.handleUpdate(profile);

    profile.set('description', 'new desc');
    profile.save().then(function (profile) {
      ok(profile.get('description') == 'new desc');
      start();
    });
  });
});

asyncTest("#handleUpdate the with modelType and id that fails", function () {
  Em.run(function () {
    var profile = make('profile');

    testHelper.handleUpdate('profile', profile.id, {succeed: false, status: 500});

    profile.set('description', 'new desc');
    profile.save().then(
      function () {
      },
      function () {
        ok(true);
        start();
      }
    );
  });
});

asyncTest("#handleUpdate with model that fails", function () {
  Em.run(function () {
    var profile = make('profile');

    testHelper.handleUpdate(profile, {succeed: false, status: 500});

    profile.set('description', 'new desc');
    profile.save().then(
      function () {
      },
      function () {
        ok(true);
        start();
      }
    );
  });
});

asyncTest("#handleUpdate with model that fails with custom response", function () {
  Em.run(function () {
    var profile = make('profile');

    testHelper.handleUpdate(profile, {succeed: false, status: 400, response: "{error: 'invalid data'}"});

    profile.set('description', 'new desc');
    profile.save().then(
      function () {
      },
      function (reason) {
        ok(true);
        equal(reason.status, 400);
        equal(reason.responseText, "{error: 'invalid data'}");
        start();
      }
    );
  });
});

asyncTest("#handleUpdate the with modelType and id that fails chained", function () {
  Em.run(function () {
    var profile = make('profile');

    testHelper.handleUpdate('profile', profile.id).andFail({
      status: 500
    });

    profile.set('description', 'new desc');
    profile.save().then(
      function () {
      },
      function (reason) {
        ok(true);
        equal(reason.status, 500);
        start();
      }
    );
  });
});

asyncTest("#handleUpdate with model that fails chained", function () {
  Em.run(function () {
    var profile = make('profile');

    testHelper.handleUpdate(profile).andFail({
      status: 500
    });

    profile.set('description', 'new desc');
    profile.save().then(
      function () {
      },
      function (reason) {
        ok(true);
        equal(reason.status, 500);
        start();
      }
    );
  });
});

asyncTest("#handleUpdate with model that fail with custom response", function () {
  Em.run(function () {
    var profile = make('profile');

    testHelper.handleUpdate(profile).andFail({
      status: 400,
      response: "{error: 'invalid data'}"
    });

    profile.set('description', 'new desc');
    profile.save().then(
      function () {
      },
      function (reason) {
        ok(true);
        equal(reason.responseText, "{error: 'invalid data'}");
        start();
      }
    );
  });
});

asyncTest("#handleUpdate with model that fail and then succeeds", function () {
  Em.run(function () {
    var profile = make('profile');

    var updateMock = testHelper.handleUpdate(profile).andFail({
      status: 400,
      response: "{error: 'invalid data'}"
    });

    profile.set('description', 'new desc');
    profile.save().then(
      function () {
      },
      function (reason) {
        equal(reason.responseText, "{error: 'invalid data'}", "Could not save model.");
      }
    ).then(function () {
        updateMock.andSucceed();

        ok(!profile.get('valid'), "Profile is invalid.");

        profile.save().then(
          function () {
            ok(!profile.get('saving'), "Saved model");
            ok(profile.get('description') == 'new desc', "Description was updated.");
            start();
          }
        );
      });
  });
});

/////// handleDelete //////////

asyncTest("#handleDelete the basic", function() {
  Em.run(function() {
    var profile = make('profile');
    testHelper.handleDelete('profile', profile.id);

    profile.destroyRecord().then(function() {
      equal(store.all('profile').get('content.length'), 0);
      start();
    });
  });
});

asyncTest("#handleDelete failure case", function() {
  Em.run(function() {
    var profile = make('profile');
    testHelper.handleDelete('profile', profile.id, false);

    profile.destroyRecord().then(
      function() {},
      function() {
        ok(true);
        start();
      }
    );
  });
});