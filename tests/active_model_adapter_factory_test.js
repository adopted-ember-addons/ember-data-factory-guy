var testHelper;
var store;

module('DS.Store#make with ActiveModelAdapter', {
  setup: function() {
    testHelper = TestHelper.setup(DS.ActiveModelAdapter);
    store = testHelper.getStore();
  },
  teardown: function() {
    Em.run(function() { testHelper.teardown(); });
  }
});


asyncTest("creates records in the store", function() {
  var user = store.makeFixture('user');

  store.find('user', user.id).then ( function(store_user) {
    deepEqual(store_user.toJSON(), user.toJSON());
    start();
  });
});

test("#resetModels clears the store of models, clears the FIXTURES arrays for each model and resets the model ids", function() {
  var project = store.makeFixture('project');
  var user = store.makeFixture('user', {projects: [project.id]});

  FactoryGuy.resetModels(store);

  equal(store.all('user').get('content.length'),0)
  equal(store.all('project').get('content.length'),0)
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
