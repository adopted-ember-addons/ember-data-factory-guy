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
  testHelper.handleCreate('profile')

  store.createRecord('profile').save().then(function(profile) {
    ok(profile instanceof Profile)
    ok(profile.get('description') == 'Text goes here')
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

  asyncTest("#handleCreate the basic", function() {
  testHelper.handleCreate('profile')

  store.createRecord('profile').save().then(function(profile) {
    ok(profile instanceof Profile)
    ok(profile.get('description') == 'Text goes here')
    start();
  });
});

asyncTest("#handleCreate with model that has camelCase attribute", function() {
  testHelper.handleCreate('profile', 'with_company', {camelCaseDescription: 'description'})

  store.createRecord('profile').save().then(function(profile) {
    ok(profile.get('camelCaseDescription') == 'description')
    start();
  });
});

asyncTest("#handleCreate failure", function() {
  testHelper.handleCreate('profile', false)

  store.createRecord('profile').save()
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
