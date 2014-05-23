var testHelper, store;

module('FactoryGuy with DS.RESTAdapter', {
  setup: function() {
    testHelper = TestHelper.setup(DS.RESTAdapter);
    store = testHelper.getStore();
  },
  teardown: function() {
    Em.run(function() { testHelper.teardown(); });
  }
});


test("#resetModels clears the store of models, and resets the model definition", function() {
  var project = store.makeFixture('project');
  var user = store.makeFixture('user', {projects: [project]});

  for (model in FactoryGuy.modelDefinitions) {
    var definition = FactoryGuy.modelDefinitions[model];
    sinon.spy(definition, 'reset');
  }

  FactoryGuy.resetModels(store);

  equal(store.all('user').get('content.length'),0)
  equal(store.all('project').get('content.length'),0)

  for (model in FactoryGuy.modelDefinitions) {
    var definition = FactoryGuy.modelDefinitions[model];
    ok(definition.reset.calledOnce);
    definition.reset.restore();
  }
});


module('DS.Store#makeFixture with RestAdapter', {
  setup: function() {
    testHelper = TestHelper.setup(DS.RESTAdapter);
    store = testHelper.getStore();
  },
  teardown: function() {
    Em.run(function() { testHelper.teardown(); });
  }
});


test("creates DS.Model instances", function() {
  var user = store.makeFixture('user');
  equal(user instanceof DS.Model, true);
});

asyncTest("creates records in the store", function() {
  var user = store.makeFixture('user');

  store.find('user', user.id).then ( function(store_user) {
    deepEqual(store_user.toJSON(), user.toJSON());
    start()
  });
});

test("supports hasMany associations", function() {
  var p1 = store.makeFixture('project');
  var p2 = store.makeFixture('project');
  var user = store.makeFixture('user', {projects: [p1, p2]})

  equal(user.get('projects.length'), 2);
});


test("when polymorphic hasMany associations are assigned, belongTo parent is assigned", function() {
  var sh = store.makeFixture('big_hat');
  var bh = store.makeFixture('small_hat');
  var user = store.makeFixture('user', {hats: [sh, bh]})
  equal(user.get('hats.length'), 2);
  ok(user.get('hats.firstObject') instanceof BigHat)
  ok(user.get('hats.lastObject') instanceof SmallHat)
  // sets the belongTo user association
  ok(sh.get('user') == user)
  ok(bh.get('user') == user)
});


test("when belongTo parent is assigned, parent adds to polymorphic hasMany records", function() {
  var user = store.makeFixture('user');
  store.makeFixture('big_hat', {user: user});
  equal(user.get('hats.length'), 1);
  ok(user.get('hats.firstObject') instanceof BigHat)
});


test("when hasMany associations assigned, belongTo parent is assigned", function() {
  var p1 = store.makeFixture('project');
  var user = store.makeFixture('user', {projects: [p1]})

  deepEqual(p1.get('user').toJSON(), user.toJSON());
});


test("when belongTo parent is assigned, parent adds to hasMany records", function() {
  var user = store.makeFixture('user');
  var project = store.makeFixture('project', {user: user});

  equal(user.get('projects.length'), 1);
});


test("belongsTo associations defined as attributes in fixture", function() {
  var project = store.makeFixture('project_with_user');
  equal(project.get('user') instanceof User, true)
  deepEqual(project.get('user').toJSON(),{name: 'User1'})

  var project = store.makeFixture('project_with_dude');
  deepEqual(project.get('user').toJSON(),{name: 'Dude'})

  var project = store.makeFixture('project_with_admin');
  deepEqual(project.get('user').toJSON(),{name: 'Admin'})
})

module('DS.Store#makeList with DS.RESTAdapter', {
  setup: function() {
    testHelper = TestHelper.setup(DS.RESTAdapter);
    store = testHelper.getStore();
  },
  teardown: function() {
    Em.run(function() { testHelper.teardown(); });
  }
});


test("creates list of DS.Model instances", function() {
  var users = store.makeList('user', 2);
  equal(users.length, 2);
  equal(users[0] instanceof DS.Model, true);
});


test("creates records in the store", function() {
  var users = store.makeList('user', 2);

  var storeUsers = store.all('user').get('content');
  deepEqual(storeUsers[0].toJSON(), users[0].toJSON());
  deepEqual(storeUsers[1].toJSON(), users[1].toJSON());
});
