var testHelper;
var store;

module('FixtureFactory with DS.FixtureAdapter', {
  setup: function() {
    testHelper = TestHelper.setup(DS.FixtureAdapter);
    store = testHelper.getStore();
  },
  teardown: function() {
    Em.run(function() { testHelper.teardown(); });
  }
});

test("creates info for model", function() {
  var fixtureJson1, fixtureJson2, fixtureJson3;
  fixtureJson1 = FixtureFactory.build('admin', {name: 'bob'});
  fixtureJson2 = FixtureFactory.build('admin', {name: 'bob'});
  fixtureJson3 = FixtureFactory.build('user');
  equal(fixtureJson1.name, 'bob', 'basic');
  equal(fixtureJson2.id, 2, 'ids are sequential');
  equal(fixtureJson3.name, 'User1', 'default values');
});

test("pushFixture adds fixture to Fixture array on model", function() {
  var fixtureJson = FixtureFactory.build('user');
  FixtureFactory.pushFixture(store.modelFor('user'), fixtureJson);
  equal(User.FIXTURES.length, 1);
  var fixtureJson2 = FixtureFactory.build('user');
  FixtureFactory.pushFixture(store.modelFor('user'), fixtureJson2);
  equal(User.FIXTURES.length, 2);
});

asyncTest("modify fixture modifies fixture in the store", function() {
  var project1 = store.makeFixture('project');
  var project2 = store.makeFixture('project');
  var user = store.makeFixture('user', {projects: [project1.id, project2.id]});

  store.find('user', user.id).then(function(user) {
    user.get('projects').then(function(projects) {
      equal(user.get('name'), 'User1');
      equal(user.get('projects').toArray().length, 2);
      start();
    });
  });
});

asyncTest("can add hasMany associations to fixtures", function() {
  var p1 = store.makeFixture('project');
  var p2 = store.makeFixture('project');
  var user = store.makeFixture('user', {projects: [p1.id, p2.id]})

  store.find('user', 1).then ( function(user) {
    user.get('projects').then( function() {
      equal(user.get('projects.length'),2, "changes hasMany records")
      start();
    })
  })
})

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


