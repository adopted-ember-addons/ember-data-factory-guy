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
    equal(store_user, user);
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

  equal(project.get('user'), user);
});


asyncTest("when asnyc hasMany associations assigned, belongTo parent is assigned", function() {
  var user = store.makeFixture('user');
  var company = store.makeFixture('company', {users: [user]});

  user.get('company').then(function(c){
    equal(c, company);
    start();
  })
});


test("when polymorphic hasMany associations are assigned, belongTo parent is assigned", function() {
  var bh = store.makeFixture('big_hat');
  var sh = store.makeFixture('small_hat');
  var user = store.makeFixture('user', {hats: [bh, sh]})

  equal(user.get('hats.members.list.length'), 2);
  ok(user.get('hats.manyArray.firstObject') instanceof BigHat)
  ok(user.get('hats.manyArray.lastObject') instanceof SmallHat)
  // sets the belongTo user association
  ok(bh.get('user') == user)
  ok(sh.get('user') == user)
});


test("when hasMany associations are assigned, belongsTo parent is assigned using inverse", function() {
  var project = store.makeFixture('project');
  var project2 = store.makeFixture('project', {children: [project]});

  equal(project.get('parent'), project2);
});


test("when hasMany associations are assigned, belongsTo parent is assigned using actual belongsTo name", function() {
  var silk = store.makeFixture('silk');
  var bh = store.makeFixture('big_hat', {materials: [silk]});

  equal(silk.get('hat'), bh)
});


test("when belongTo parent is assigned, parent adds to hasMany records", function() {
  var user = store.makeFixture('user');
  var project1 = store.makeFixture('project', {user: user});
  var project2 = store.makeFixture('project', {user: user});

  equal(user.get('projects.members.list.length'), 2);
  equal(user.get('projects.manyArray.firstObject'), project1);
  equal(user.get('projects.manyArray.lastObject'), project2);
});


test("when belongTo parent is assigned, parent adds to polymorphic hasMany records", function() {
  var user = store.makeFixture('user');
  store.makeFixture('big_hat', {user: user});
  store.makeFixture('small_hat', {user: user});

  equal(user.get('hats.members.list.length'), 2);
  ok(user.get('hats.manyArray.firstObject') instanceof BigHat)
  ok(user.get('hats.manyArray.lastObject') instanceof SmallHat)
});


asyncTest("when async hasMany relationship is assigned, model relationship is synced on both sides", function() {
  var property = store.makeFixture('property');
  var user1 = store.makeFixture('user', {properties: [property]});
  var user2 = store.makeFixture('user', {properties: [property]});

  equal(property.get('owners.members.list.length'), 2);
  equal(property.get('owners.manyArray.firstObject'), user1);
  equal(property.get('owners.manyArray.lastObject'), user2);
  start();
});


asyncTest("when async belongsTo parent is assigned, parent adds to hasMany records", function() {
  var company = store.makeFixture('company');
  var user1 = store.makeFixture('user', {company: company});
  var user2 = store.makeFixture('user', {company: company});

  equal(company.get('users.members.list.length'), 2);
  equal(company.get('users.manyArray.firstObject'), user1);
  equal(company.get('users.manyArray.lastObject'), user2);
  start();
});


test("when belongTo parent is assigned, parent adds to hasMany record using inverse", function() {
  var project = store.makeFixture('project');
  var project2 = store.makeFixture('project', {parent: project});

  equal(project.get('children.members.list.length'), 1);
  equal(project.get('children.manyArray.firstObject'), project2);
});


test("when belongTo parent is assigned, parent adds to hasMany record using actual hasMany name", function() {
  var bh = store.makeFixture('big_hat');
  var silk = store.makeFixture('silk', {hat: bh});

  equal(bh.get('materials.manyArray.firstObject'), silk)
});


test("when belongTo parent is assigned, parent adds to belongsTo record", function() {
  var company = store.makeFixture('company');
  var profile = store.makeFixture('profile', {company: company});
  equal(company.get('profile'), profile);

  // but guard against a situation where a model can belong to itself
  // and do not want to set the belongsTo on this case.
  var hat1 = store.makeFixture('big_hat')
  var hat2 = store.makeFixture('big_hat', {hat: hat1})
  equal(hat1.get('hat'), null);
  equal(hat2.get('hat'), hat1);
});


test("belongsTo associations defined as attributes in fixture", function() {
  var project = store.makeFixture('project_with_user');
  equal(project.get('user') instanceof User, true)
  equal(project.get('user.name'), 'User1');

  var project = store.makeFixture('project_with_dude');
  equal(project.get('user.name'), 'Dude');

  var project = store.makeFixture('project_with_admin');
  equal(project.get('user.name'), 'Admin');
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
  equal(storeUsers[0], users[0]);
  equal(storeUsers[1], users[1]);
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

