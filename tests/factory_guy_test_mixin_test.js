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
    make = function() {return testHelper.make.apply(testHelper,arguments)}
  },
  teardown: function () {
    testHelper.teardown();
  }
});

/////// handleCreate //////////

asyncTest("#handleCreate the basic", function() {
  var customDescription = "special description"

  testHelper.handleCreate('profile', {
    match: {description: customDescription}
  })

  store.createRecord('profile', {
    description: customDescription
  }).save().then(function(profile) {
    ok(profile instanceof Profile)
    ok(profile.get('description') == customDescription)
    start();
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

asyncTest("#handleFindQuery passing in json creates new instances and returns those", function() {
  var users = FactoryGuy.buildList('user', 2);
  testHelper.handleFindQuery('user', ['name'], users);

  store.findQuery('user', {name: 'Bob'}).then(function (users) {
    equal(users.get('length'), 2)
    equal(users.get('firstObject.name'), 'User1')
    equal(users.get('lastObject.name'), 'User2')
    start();
  })
});

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


/////// handleFindMany //////////

asyncTest("#handleFindMany the basic", function () {
  testHelper.handleFindMany('profile', 2);

  store.find('profile').then(function (profiles) {
    ok(profiles.get('length') == 2);
    start();
  });
});

asyncTest("#handleFindMany with fixture options", function () {
  testHelper.handleFindMany('profile', 2, {description: 'dude'});

  store.find('profile').then(function (profiles) {
    ok(profiles.get('length') == 2);
    ok(profiles.get('firstObject.description') == 'dude');
    start();
  });
});

asyncTest("#handleFindMany with traits", function () {
  testHelper.handleFindMany('profile', 2, 'goofy_description');

  store.find('profile').then(function (profiles) {
    ok(profiles.get('length') == 2);
    ok(profiles.get('firstObject.description') == 'goofy');
    start();
  });
});

asyncTest("#handleFindMany with traits and extra options", function () {
  testHelper.handleFindMany('profile', 2, 'goofy_description', {description: 'dude'});

  store.find('profile').then(function (profiles) {
    ok(profiles.get('length') == 2);
    ok(profiles.get('firstObject.description') == 'dude');
    start();
  });
});




module('FactoryGuyTestMixin (using mockjax) with DS.ActiveModelAdapter', {
  setup: function () {
    testHelper = TestHelper.setup(DS.ActiveModelAdapter);
    store = testHelper.getStore();
    make = function() {return testHelper.make.apply(testHelper,arguments)}
  },
  teardown: function () {
    testHelper.teardown();
  }
});


/////// handleCreate //////////

asyncTest("#handleCreate with no specific match", function() {
  testHelper.handleCreate('profile');

  store.createRecord('profile', {description: 'whatever'}).save().then(function(profile) {
    ok(profile.id == 1)
    ok(profile.get('description') == 'whatever')
    start();
  });
});

asyncTest("#handleCreate matches attributes and returns these", function() {
  var customDescription = "special description"

  testHelper.handleCreate('profile', {
    match: {description: customDescription}
  })

  store.createRecord('profile', {
    description: customDescription
  }).save().then(function(profile) {
    ok(profile instanceof Profile)
    ok(profile.id == 1)
    ok(profile.get('description') == customDescription)
    start();
  });
});


asyncTest("#handleCreate returns attributes", function() {
  var date = new Date()

  testHelper.handleCreate('profile', {
    returns: {created_at: date}
  })

  store.createRecord('profile').save().then(function(profile) {
    ok(profile.get('created_at') == date.toString())
    start();
  });
});

asyncTest("#handleCreate returns camelCase attributes", function() {
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

asyncTest("#handleCreate match belongsTo association", function() {
  var company = make('company')
  testHelper.handleCreate('profile', {match:{ company: company}})

  store.createRecord('profile', {company: company}).save().then(function(profile) {
    ok(profile.get('company') == company)
    start();
  });
});

asyncTest("#handleCreate match belongsTo polymorphic association", function() {
  var group = make('group')
  testHelper.handleCreate('profile', {match:{ group: group}})

  store.createRecord('profile', {group: group}).save().then(function(profile) {
    ok(profile.get('group') == group)
    start();
  });
});


asyncTest("#handleCreate match attributes and return attributes", function() {
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


asyncTest("#handleCreate failure", function() {
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


asyncTest("#handleCreate match but still fail", function() {
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



/////// handleFindMany //////////


asyncTest("#handleFindMany the basic", function () {
  testHelper.handleFindMany('profile', 2);

  store.find('profile').then(function (profiles) {
    ok(profiles.get('length') == 2);
    ok(profiles.get('firstObject.description') == 'Text goes here');
    start();
  });
});

asyncTest("#handleFindMany with fixture options", function () {
  testHelper.handleFindMany('profile', 2, {description: 'dude'});

  store.find('profile').then(function (profiles) {
    ok(profiles.get('length') == 2);
    ok(profiles.get('firstObject.description') == 'dude');
    start();
  });
});

asyncTest("#handleFindMany with traits", function () {
  testHelper.handleFindMany('profile', 2, 'goofy_description');

  store.find('profile').then(function (profiles) {
    ok(profiles.get('length') == 2);
    ok(profiles.get('firstObject.description') == 'goofy');
    start();
  });
});

asyncTest("#handleFindMany with traits and fixture options", function () {
  testHelper.handleFindMany('profile', 2, 'goofy_description', {description: 'dude'});

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
  assert.throws(function(){testHelper.handleUpdate('profile', false)},"missing id");
  assert.throws(function(){testHelper.handleUpdate('profile', true)},"missing id");
});

asyncTest("#handleUpdate the with modelType and id", function() {
  var profile = make('profile');
  testHelper.handleUpdate('profile', profile.id);

  profile.set('description','new desc');
  profile.save().then(function(profile) {
    ok(profile.get('description') == 'new desc');
    start();
  });
});


asyncTest("#handleUpdate the with model", function() {
  var profile = make('profile');
  testHelper.handleUpdate(profile, true, {e:1});

  profile.set('description','new desc');
  profile.save().then(function(profile) {
    ok(profile.get('description') == 'new desc');
    start();
  });
});

asyncTest("#handleUpdate the with modelType and id that fails", function() {
  var profile = make('profile');
  testHelper.handleUpdate('profile', profile.id, false);

  profile.set('description','new desc');
  profile.save().then(
    function() {},
    function() {
      ok(true)
      start();
    }
  )
});

asyncTest("#handleUpdate with model that fails", function() {
  var profile = make('profile');
  testHelper.handleUpdate(profile, false);

  profile.set('description','new desc');
  profile.save().then(
      function() {},
      function() {
        ok(true)
        start();
      }
    )
});


/////// handleDelete //////////

asyncTest("#handleDelete the basic", function() {
  var profile = make('profile');
  testHelper.handleDelete('profile', profile.id);

  profile.destroyRecord().then(function() {
    equal(store.all('profile').get('content.length'), 0);
    start();
  });
});

asyncTest("#handleDelete failure case", function() {
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


