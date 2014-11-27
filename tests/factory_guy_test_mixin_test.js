var testHelper, store;

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
  },
  teardown: function () {
    testHelper.teardown();
  }
});


/////// handleCreate //////////

asyncTest("#handleCreate with no specific match (which returns no id)", function() {
  testHelper.handleCreate('profile');

  store.createRecord('profile', {description: 'whatever'}).save().then(function(profile) {
    ok(profile.id == null) // no id returned when non specific matching
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
  var company = store.makeFixture('company')
  testHelper.handleCreate('profile', {match:{ company: company}})

  store.createRecord('profile', {company: company}).save().then(function(profile) {
    ok(profile.get('company') == company)
    start();
  });
});

asyncTest("#handleCreate match belongsTo polymorphic association", function() {
  var group = store.makeFixture('group')
  testHelper.handleCreate('profile', {match:{ group: group}})

  store.createRecord('profile', {group: group}).save().then(function(profile) {
    ok(profile.get('group') == group)
    start();
  });
});


asyncTest("#handleCreate match attributes and return attributes", function() {
  var date = new Date()
  var customDescription = "special description"
  var company = store.makeFixture('company')
  var group = store.makeFixture('big_group')

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

asyncTest("#handleUpdate the basic", function() {
  var profile = store.makeFixture('profile');
  testHelper.handleUpdate('profile', profile.id);

  profile.set('description','new desc');
  profile.save().then(function(profile) {
    ok(profile.get('description') == 'new desc');
    start();
  });
});

asyncTest("#handleUpdate failure", function() {
  var profile = store.makeFixture('profile');
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


/////// handleDelete //////////

asyncTest("#handleDelete the basic", function() {
  var profile = store.makeFixture('profile');
  testHelper.handleDelete('profile', profile.id);

  profile.destroyRecord().then(function() {
    equal(store.all('profile').get('content.length'), 0);
    start();
  });
});

asyncTest("#handleDelete failure case", function() {
  var profile = store.makeFixture('profile');
  testHelper.handleDelete('profile', profile.id, false);

  profile.destroyRecord().then(
    function() {},
    function() {
      ok(true);
      start();
    }
  );
});
