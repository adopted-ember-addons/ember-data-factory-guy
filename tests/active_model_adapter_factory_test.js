var testHelper, store;

module('FactoryGuy with ActiveModelAdapter', {
  setup: function() {
    testHelper = TestHelper.setup(DS.ActiveModelAdapter);
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


module('DS.Store#makeFixture with ActiveModelAdapter', {
  setup: function() {
    testHelper = TestHelper.setup(DS.ActiveModelAdapter);
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

test("when hasMany associations assigned, belongTo parent is assigned", function() {
  var project = store.makeFixture('project');
  var user = store.makeFixture('user', {projects: [project]})

  deepEqual(project.get('user').toJSON(), user.toJSON());
});


asyncTest("when asnyc hasMany associations assigned, belongTo parent is assigned", function() {
  var user = store.makeFixture('user');
  var company = store.makeFixture('company', {users: [user]});

  user.get('company').then(function(c){
    deepEqual(c.toJSON(), company.toJSON())
    start();
  })
});


test("when polymorphic hasMany associations are assigned, belongTo parent is assigned", function() {
  var bh = store.makeFixture('big_hat');
  var sh = store.makeFixture('small_hat');
  var user = store.makeFixture('user', {hats: [bh, sh]})

  equal(user.get('hats.length'), 2);
  ok(user.get('hats.firstObject') instanceof BigHat)
  ok(user.get('hats.lastObject') instanceof SmallHat)
  // sets the belongTo user association
  ok(bh.get('user') == user)
  ok(sh.get('user') == user)
});

test("when belongsTo associations is assigned, belongTo parent is assigned", function() {
  var p1 = store.makeFixture('profile');
  var employee = store.makeFixture('employee', {profile: p1})

  equal(employee.get('profile'), p1);
  equal(p1.get('employee'), employee);
});


test("when belongTo parent is assigned, parent adds to hasMany records", function() {
  var user = store.makeFixture('user');
  var project1 = store.makeFixture('project', {user: user});
  var project2 = store.makeFixture('project', {user: user});

  equal(user.get('projects.length'), 2);
  deepEqual(user.get('projects.firstObject').toJSON(), project1.toJSON());
  deepEqual(user.get('projects.lastObject').toJSON(), project2.toJSON());
});


test("when belongTo parent is assigned, parent adds to polymorphic hasMany records", function() {
  var user = store.makeFixture('user');
  store.makeFixture('big_hat', {user: user});
  store.makeFixture('small_hat', {user: user});

  equal(user.get('hats.length'), 2);
  ok(user.get('hats.firstObject') instanceof BigHat)
  ok(user.get('hats.lastObject') instanceof SmallHat)
});

asyncTest("when async belongsTo parent is assigned, parent adds to hasMany records", function() {
  var company = store.makeFixture('company');
  var user1 = store.makeFixture('user', {company: company});
  var user2 = store.makeFixture('user', {company: company});

  equal(company.get('users.length'), 2);
  deepEqual(company.get('users.firstObject').toJSON(), user1.toJSON());
  deepEqual(company.get('users.lastObject').toJSON(), user2.toJSON());
  start();
});

test("belongsTo associations defined as attributes in fixture", function() {
  var project = store.makeFixture('project_with_user');
  equal(project.get('user') instanceof User, true)
  deepEqual(project.get('user').toJSON(),{name: 'User1', company: null})

  var project = store.makeFixture('project_with_dude');
  deepEqual(project.get('user').toJSON(),{name: 'Dude', company: null})

  var project = store.makeFixture('project_with_admin');
  deepEqual(project.get('user').toJSON(),{name: 'Admin', company: null})
});


module('DS.Store#makeList with ActiveModelAdapter', {
  setup: function() {
    testHelper = TestHelper.setup(DS.ActiveModelAdapter);
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
