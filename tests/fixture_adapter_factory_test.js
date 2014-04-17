var testHelper;
var store;

module('FactoryGuy with DS.FixtureAdapter', {
  setup: function() {
    testHelper = TestHelper.setup(DS.FixtureAdapter);
    store = testHelper.getStore();
  },
  teardown: function() {
    Em.run(function() { testHelper.teardown(); });
  }
});


test("#build creates default json for model", function() {
  var json = FactoryGuy.build('user');
  console.log(json)
  deepEqual(json, {id: 1, name: 'User1'});
});


test("#build can override default model attributes", function() {
  var json = FactoryGuy.build('user',{name: 'bob'});
  deepEqual(json, {id: 1, name: 'bob'});
});


test("#build can have named model definition with custom attributes", function() {
  var json = FactoryGuy.build('admin')
  deepEqual(json, {id: 1, name: 'Admin'});
});


test("#build can override named model attributes", function() {
  var json = FactoryGuy.build('admin', {name: 'AdminGuy'})
  deepEqual(json, {id: 1, name: 'AdminGuy'});
});


test("#build similar model type ids are created sequentially", function() {
  var user1 = FactoryGuy.build('user');
  var user2 = FactoryGuy.build('user');
  var project = FactoryGuy.build('project');
  equal(user1.id, 1);
  equal(user2.id, 2);
  equal(project.id, 1);
});


test("#pushFixture adds fixture to Fixture array on model", function() {
  var fixtureJson = FactoryGuy.build('user');
  FactoryGuy.pushFixture(store.modelFor('user'), fixtureJson);
  equal(User.FIXTURES.length, 1);
  var fixtureJson2 = FactoryGuy.build('user');
  FactoryGuy.pushFixture(store.modelFor('user'), fixtureJson2);
  equal(User.FIXTURES.length, 2);
});


asyncTest( "can change fixture attributes after creation", function() {
  var user = store.makeFixture('user');
  user.name = "new name";

  store.find('user', 1).then( function(user) {
    equal(user.get('name'), "new name", "changes local attributes");
    start();
  });
});


module('DS.Store with DS.FixtureAdapter', {
  setup: function() {
    testHelper = TestHelper.setup(DS.FixtureAdapter);
    store = testHelper.getStore();
  },
  teardown: function() {
    Em.run(function() { testHelper.teardown(); });
  }
});


test("#make builds and pushes fixture into the store", function() {
  store.makeFixture('user');
  equal(User.FIXTURES.length, 1);
});


asyncTest("#makeFixture sets hasMany associations on fixtures", function() {
  var p1 = store.makeFixture('project');
  store.makeFixture('project'); // this project not added
  var user = store.makeFixture('user', {projects: [p1.id]})

  store.find('user', 1).then ( function(user) {
    user.get('projects').then( function(projects) {
      equal(projects.get('length'), 1, "adds hasMany records");
      equal(projects.get('firstObject.user.id'), 1, "sets belongsTo record");
      start();
    })
  })
})
