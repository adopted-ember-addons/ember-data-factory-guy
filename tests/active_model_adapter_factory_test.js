var testHelper, store;

module('FactoryGuy with ActiveModelAdapter', {
  setup: function() {
    testHelper = TestHelper.setup(DS.ActiveModelAdapter);
    store = testHelper.getStore();
  },
  teardown: function() {
    testHelper.teardown();
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

//  equal(store.all('user').get('content.length'),0)
//  equal(store.all('project').get('content.length'),0)

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
    ok(store_user == user);
    start()
  });
});


test("handles camelCase attributes", function() {
  var profile = store.makeFixture('profile', {camelCaseDescription: 'description'});
  ok(!!profile.get('camelCaseDescription'))
});


test("when hasMany associations assigned, belongTo parent is assigned", function() {
  var project = store.makeFixture('project');
  var user = store.makeFixture('user', {projects: [project]})

  ok(project.get('user') == user);
});


asyncTest("when hasMany ( asnyc ) associations assigned, belongTo parent is assigned", function() {
  var user = store.makeFixture('user');
  var company = store.makeFixture('company', {users: [user]});

  user.get('company').then(function(c){
    ok(c == company);
    start();
  })
});


test("when hasMany ( polymorphic ) associations are assigned, belongTo parent is assigned", function() {
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


test("when hasMany ( self referential ) associations are assigned, belongsTo parent is assigned", function() {
  var big_group = store.makeFixture('big_group');
  var group = store.makeFixture('group', {versions: [big_group]});
  ok(big_group.get('group') == group)
});


test("when hasMany associations are assigned, belongsTo parent is assigned using inverse", function() {
  var project = store.makeFixture('project');
  var project2 = store.makeFixture('project', {children: [project]});

  ok(project.get('parent') == project2);
});


test("when hasMany associations are assigned, belongsTo parent is assigned using actual belongsTo name", function() {
  var silk = store.makeFixture('silk');
  var big_hat = store.makeFixture('big_hat', {materials: [silk]});

  ok(silk.get('hat') == big_hat)
});


test("when hasMany associations are assigned, belongsTo ( polymorphic ) parent is assigned", function() {
  var fluff = store.makeFixture('fluffy_material');
  var big_hat = store.makeFixture('big_hat', {fluffy_materials: [fluff]});

  ok(fluff.get('hat') == big_hat)
});


test("when belongTo parent is assigned, parent adds to hasMany records", function() {
  var user = store.makeFixture('user');
  var project1 = store.makeFixture('project', {user: user});
  var project2 = store.makeFixture('project', {user: user});

  equal(user.get('projects.length'), 2);
  ok(user.get('projects.firstObject') == project1);
  ok(user.get('projects.lastObject') == project2);
});


test("when belongTo parent is assigned, parent adds to polymorphic hasMany records", function() {
  var user = store.makeFixture('user');
  store.makeFixture('big_hat', {user: user});
  store.makeFixture('small_hat', {user: user});

  equal(user.get('hats.length'), 2);
  ok(user.get('hats.firstObject') instanceof BigHat)
  ok(user.get('hats.lastObject') instanceof SmallHat)
});


asyncTest("when async hasMany relationship is assigned, model relationship is synced on both sides", function() {
  var property = store.makeFixture('property');
  var user1 = store.makeFixture('user', {properties: [property]});
  var user2 = store.makeFixture('user', {properties: [property]});

  equal(property.get('owners.length'), 2);
  ok(property.get('owners.firstObject') == user1);
  ok(property.get('owners.lastObject') == user2);
  start();
});


asyncTest("when async belongsTo parent is assigned, parent adds to hasMany records", function() {
  var company = store.makeFixture('company');
  var user1 = store.makeFixture('user', {company: company});
  var user2 = store.makeFixture('user', {company: company});

  equal(company.get('users.length'), 2);
  ok(company.get('users.firstObject') == user1);
  ok(company.get('users.lastObject') == user2);
  start();
});


test("when belongTo parent is assigned, parent adds to hasMany record using inverse", function() {
  var project = store.makeFixture('project');
  var project2 = store.makeFixture('project', {parent: project});

  equal(project.get('children.length'), 1);
  ok(project.get('children.firstObject') == project2);
});


test("when belongTo parent is assigned, parent adds to hasMany record using actual hasMany name", function() {
  var bh = store.makeFixture('big_hat');
  var silk = store.makeFixture('silk', {hat: bh});

  ok(bh.get('materials.firstObject') == silk)
});


test("when belongTo parent is assigned, parent adds to belongsTo record", function() {
  var company = store.makeFixture('company');
  var profile = store.makeFixture('profile', {company: company});
  ok(company.get('profile') == profile);

  // but guard against a situation where a model can belong to itself
  // and do not want to set the belongsTo on this case.
  var hat1 = store.makeFixture('big_hat')
  var hat2 = store.makeFixture('big_hat', {hat: hat1})
  ok(hat1.get('hat') == null);
  ok(hat2.get('hat') == hat1);
});


test("belongsTo associations defined as attributes in fixture", function() {
  var project = store.makeFixture('project_with_user');
  equal(project.get('user') instanceof User, true)
  ok(project.get('user.name') == 'User1');

  var project = store.makeFixture('project_with_dude');
  ok(project.get('user.name') == 'Dude');

  var project = store.makeFixture('project_with_admin');
  ok(project.get('user.name') == 'Admin');
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
  ok(users[0] instanceof DS.Model == true);
});


test("creates records in the store", function() {
  var users = store.makeList('user', 2);

  var storeUsers = store.all('user').get('content');
  ok(storeUsers[0] == users[0]);
  ok(storeUsers[1] == users[1]);
});



module('DS.Store with ActiveModelAdapter', {
  setup: function() {
    testHelper = TestHelper.setup(DS.ActiveModelAdapter);
    store = testHelper.getStore();
  },
  teardown: function() {
    Em.run(function() { testHelper.teardown(); });
  }
});


asyncTest("#createRecord (with mockjax) handles model's camelCase attributes", function() {
  testHelper.handleCreate('profile', {camelCaseDescription: 'description'})

  store.createRecord('profile').save().then(function(profile) {
    ok(!!profile.get('camelCaseDescription'))
    start();
  });
});


asyncTest("#find (with mockajax) handles model's camelCase attributes", function() {
  var responseJson = testHelper.handleFind('profile', {camelCaseDescription: 'description'})
  var id = responseJson.profile.id

  store.find('profile', id).then(function(profile) {
    ok(!!profile.get('camelCaseDescription'))
    start();
  });
});

