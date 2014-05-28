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


test("creates DS.Model instance", function() {
  var user = store.makeFixture('user');
  equal(user instanceof DS.Model, true);
});


asyncTest("creates record in the store", function() {
  var user = store.makeFixture('user');

  store.find('user', user.id).then ( function(store_user) {
    deepEqual(store_user.toJSON(), user.toJSON());
    start();
  });
});


test("supports hasMany associations", function() {
  var p1 = store.makeFixture('project');
  var p2 = store.makeFixture('project');
  var user = store.makeFixture('user', {projects: [p1, p2]})

  equal(user.get('projects.length'), 2);
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

asyncTest("when async hasMany associations are assigned, async belongTo parent is assigned", function() {
  var e1 = store.makeFixture('employee');
  var e2 = store.makeFixture('employee');
  var department = store.makeFixture('department', {employees: [e1, e2]})

  equal(department.get('employees.length'), 2);
  ok(department.get('employees.firstObject') instanceof Employee)
  ok(department.get('employees.lastObject') instanceof Employee)

  e1.get('department').then(function(employeeDepartment) {
	ok(employeeDepartment == department);
	start();
  });
});

test("when belongsTo associations is assigned, belongTo parent is assigned", function() {
  ok(false, "One-to-one relation is not working. Test is disabled as the other tests will hang.");
  //var p1 = store.makeFixture('profile');
  //var employee = store.makeFixture('employee', {profile: p1})

  //equal(employee.get('profile'), p1);
  //equal(p1.get('employee'), employee);
});


test("when belongTo parent is assigned, parent adds to polymorphic hasMany records", function() {
  var user = store.makeFixture('user');
  store.makeFixture('big_hat', {user: user});
  store.makeFixture('small_hat', {user: user});

  equal(user.get('hats.length'), 2);
  ok(user.get('hats.firstObject') instanceof BigHat)
  ok(user.get('hats.lastObject') instanceof SmallHat)
});

test("when async belongTo parent is assigned, parent adds to async hasMany records", function() {
  var department = store.makeFixture('department');
  store.makeFixture('employee', {department: department});
  store.makeFixture('employee', {department: department});

  equal(department.get('employees.length'), 2);
  ok(department.get('employees.firstObject') instanceof Employee)
  ok(department.get('employees.lastObject') instanceof Employee)
});

test("when hasMany associations assigned, belongTo parent is assigned", function() {
  var p1 = store.makeFixture('project');
  var user = store.makeFixture('user', {projects: [p1]})

  deepEqual(p1.get('user').toJSON(), user.toJSON());
});


test("when belongTo parent is assigned, parent adds to hasMany records", function() {
  var user = store.makeFixture('user');
  store.makeFixture('project', {user: user});
  store.makeFixture('project', {user: user});

  equal(user.get('projects.length'), 2);
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
