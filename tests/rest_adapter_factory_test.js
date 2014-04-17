var testHelper;
var store;

module('DS.Store#make with RestAdapter', {
  setup: function() {
    testHelper = TestHelper.setup(DS.RESTAdapter);
    store = testHelper.getStore();
  },
  teardown: function() {
    Em.run(function() { testHelper.teardown(); });
  }
});


test("supports hasMany associations", function() {
  var p1 = store.makeFixture('project');
  var p2 = store.makeFixture('project');
  var user = store.makeFixture('user', {projects: [p1.id, p2.id]})

  equal(user.get('projects.length'), 2);
})


test("when hasMany associations used, belongTo parent is assigned", function() {
  var p1 = store.makeFixture('project');
  var user = store.makeFixture('user', {projects: [p1.id]})

  deepEqual(p1.get('user').toJSON(), user.toJSON());
})

module('DS.Store with ActiveModelAdapter', {
  setup: function() {
    testHelper = TestHelper.setup(DS.RESTAdapter);
    store = testHelper.getStore();
  },
  teardown: function() {
    Em.run(function() { testHelper.teardown(); });
  }
});

asyncTest("#make builds and creates record", function() {
  var user = store.makeFixture('user');

  store.find('user', user.id).then ( function(store_user) {
    deepEqual(store_user.toJSON(), user.toJSON());
    start()
  });
});


