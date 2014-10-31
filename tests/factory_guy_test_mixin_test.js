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
    $.mockjaxClear();
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


/////// handleFind //////////

asyncTest("#handleFind the basic", function() {
  var responseJson = testHelper.handleFind('profile');
  var id = responseJson.profile.id;

  store.find('profile', id).then(function(profile) {
    ok(profile.get('description') == 'Text goes here');
    start();
  });
});

asyncTest("#handleFind with fixture options", function() {
  var responseJson = testHelper.handleFind('profile', {description: 'dude'});
  var id = responseJson.profile.id;

  store.find('profile', id).then(function(profile) {
    ok(profile.get('description') == 'dude');
    start();
  });
});

asyncTest("#handleFind with traits", function() {
  var responseJson = testHelper.handleFind('profile', 'goofy_description');
  var id = responseJson.profile.id;

  store.find('profile', id).then(function(profile) {
    ok(profile.get('description') == 'goofy');
    start();
  });
});

asyncTest("#handleFind with traits and fixture options", function() {
  var responseJson = testHelper.handleFind('profile', 'goofy_description', {description: 'dude'});
  var id = responseJson.profile.id;

  store.find('profile', id).then(function(profile) {
    ok(profile.get('description') == 'dude');
    start();
  });
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
    $.mockjaxClear();
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
  testHelper.handleCreate('profile', {camelCaseDescription: 'description'})

  store.createRecord('profile').save().then(function(profile) {
    ok(profile.get('camelCaseDescription') == 'description')
    start();
  });
});


/////// handleFind //////////

asyncTest("#handleFind the basic", function() {
  var responseJson = testHelper.handleFind('profile');
  var id = responseJson.profile.id;

  store.find('profile', id).then(function(profile) {
    ok(profile.get('description') == 'Text goes here');
    start();
  });
});

asyncTest("#handleFind with fixture options", function() {
  var responseJson = testHelper.handleFind('profile', {description: 'dude'});
  var id = responseJson.profile.id;

  store.find('profile', id).then(function(profile) {
    ok(profile.get('description') == 'dude');
    start();
  });
});

asyncTest("#handleFind with traits", function() {
  var responseJson = testHelper.handleFind('profile', 'goofy_description');
  var id = responseJson.profile.id;

  store.find('profile', id).then(function(profile) {
    ok(profile.get('description') == 'goofy');
    start();
  });
});

asyncTest("#handleFind with traits and fixture options", function() {
  var responseJson = testHelper.handleFind('profile', 'goofy_description', {description: 'dude'});
  var id = responseJson.profile.id;

  store.find('profile', id).then(function(profile) {
    ok(profile.get('description') == 'dude');
    start();
  });
});

asyncTest("#handleFind with model that has camelCase attribute", function() {
  var responseJson = testHelper.handleFind('profile', {camelCaseDescription: 'description'});
  var id = responseJson.profile.id;

  store.find('profile', id).then(function(profile) {
    ok(!!profile.get('camelCaseDescription'));
    start();
  });
});


// TODO: will take a major refactor to get this working

//asyncTest("#handleFind with nested hierarchy of embedded models", function() {
//  var responseJson = testHelper.handleFind('project', 'with_user');
//  var id = responseJson.project.id;
//
//  store.find('project', id).then(function(project) {
//    var user = project.get('user');
//    var hats = user.get('hats');
//    var firstHat = hats.get('firstObject');
//    var lastHat = hats.get('lastObject');

//    ok(user.get('projects.firstObject') == project)
//    ok(firstHat.get('user') == user)
//    ok(firstHat.get('outfit.id') == 1)
//    ok(firstHat.get('outfit.hats.length') == 1)
//    ok(firstHat.get('outfit.hats.firstObject') == firstHat)
//
//    ok(lastHat.get('user') == user)
//    ok(lastHat.get('outfit.id') == 2)
//    ok(lastHat.get('outfit.hats.length') == 1)
//    ok(lastHat.get('outfit.hats.firstObject') == lastHat)

//    start();
//  });
//});


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


/////// handleDelete //////////
asyncTest("#handleDelete with model that has camelCase attribute", function() {
  var profile = store.makeFixture('profile');
  testHelper.handleDelete('profile', profile.id);

  profile.destroyRecord().then(function() {
    equal(store.all('profile').get('content.length'), 0);
    start();
  });
});
