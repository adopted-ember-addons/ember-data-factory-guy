var testHelper, store;

module('FactoryGuyTestMixin with DS.RESTAdapter', {
});


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


module('FactoryGuyTestMixin with DS.RESTAdapter', {
  setup: function() {
    testHelper = TestHelper.setup(DS.RESTAdapter);
    store = testHelper.getStore();
  },
  teardown: function() {
    Em.run(function() { testHelper.teardown(); });
  }
});


asyncTest("#createManyRecords (with mockjax) handles creating many records", function() {
  var responseJson = FactoryGuy.buildList('profile', 2)
  testHelper.stubEndpointForHttpRequest( '/profiles', {profiles: responseJson})

  store.find('profile').then(function(profiles) {
    ok(profiles.get('length') == 2)
    start()
  })
})

//asyncTest("#createRecord (with mockjax) handles creating a record", function() {
//
//})


module('FactoryGuyTestMixin with DS.ActiveModelAdapter', {
  setup: function() {
    testHelper = TestHelper.setup(DS.ActiveModelAdapter);
    store = testHelper.getStore();
  },
  teardown: function() {
    testHelper.teardown();
    Em.run(function() {
      console.log('teardown')
      testHelper.teardown();
    });
  }
});


//asyncTest("#createRecord (with mockjax) handles model's camelCase attributes", function() {
//  testHelper.handleCreate('profile', {camelCaseDescription: 'description'})
//
//  store.createRecord('profile').save().then(function(profile) {
//    ok(!!profile.get('camelCaseDescription'))
//    start();
//  });
//});


asyncTest("#handleFind (with mockajax) handles model's camelCase attributes", function() {
  var responseJson = testHelper.handleFind('profile', 'goofy_description');
  var id = responseJson.profile.id;

  store.find('profile', id).then(function(profile) {
    ok(true);
    console.log('after ward', profile.get('description'))
    start();
  });
});

//asyncTest("#handleFind (with mockajax) handles model's camelCase attributes", function() {
//  var responseJson = testHelper.handleFind('profile', {camelCaseDescription: 'description'});
//  var id = responseJson.profile.id;
//
//  store.find('profile', id).then(function(profile) {
//    ok(!!profile.get('camelCaseDescription'));
//    start();
//  });
//});

//asyncTest("#handleFindMany (with mockajax) handles returning many records", function() {
//  testHelper.handleFindMany('profile', 2, {description: 'dude'});
//
//  store.find('profile').then(function(profiles) {
//    ok(profiles.get('length') == 2);
//    console.log('after ward', profiles.get('firstObject.description'))
//    start();
//  });
//});

//asyncTest("#handleFindMany (with mockajax) deals with traits in arguments", function() {
//  testHelper.handleFindMany('profile', 2, 'goofy_description');
//  Em.run(function(){
//    store.find('profile').then(function(profiles) {
//      console.log(profiles.get('firstObject.description'))
//      console.log(profiles.get('lastObject.description'))
//      ok(profiles.get('firstObject.description') == 'goofy');
//      start();
//    });
//  });
//});
//
