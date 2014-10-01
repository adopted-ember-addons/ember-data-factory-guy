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

//asyncTest("#handleFind handles associations", function() {
//  var projectJSON = FactoryGuy.build('project');
//  var userJSON = FactoryGuy.build('user', {projects: [projectJSON.id]});
//  projectJSON.user = userJSON.id
//
//  testHelper.handleSideloadFind('user', userJSON, {projects: [projectJSON]})
//
//  store.find('user', userJSON.id).then(function(user) {
//    console.log(user.toJSON())
//    console.log(userJSON)
////    console.log(user+'',user.get('projects.firstObject').toJSON())
////    console.log(user.get('projects.firstObject.user')+'')
////    ok(user.toJSON() == userJSON)
//    ok(user instanceof User)
//    ok(user.get('projects.firstObject.user') == user)
////    deepEqual(user.get('projects.firstObject').toJSON(), project)
//    start();
//  });
//});
