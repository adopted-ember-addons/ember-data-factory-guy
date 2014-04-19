window.testHelper;
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
  FactoryGuy.pushFixture(User, fixtureJson);
  equal(User.FIXTURES.length, 1);

  var fixtureJson2 = FactoryGuy.build('user');
  FactoryGuy.pushFixture(User, fixtureJson2);
  equal(User.FIXTURES.length, 2);
});


asyncTest("can change fixture attributes after creation", function() {
  var user = store.makeFixture('user');
  user.name = "new name";

  store.find('user', 1).then( function(user) {
    equal(user.get('name'), "new name", "changes local attributes");
    start();
  });
});


test("#resetModels clears the store of models, clears the FIXTURES arrays for each model and resets the model ids", function() {
  var project = store.makeFixture('project');
  var user = store.makeFixture('user', {projects: [project.id]});

  FactoryGuy.resetModels(store);

  equal(User.FIXTURES.length, 0);
  equal(Project.FIXTURES.length, 0);

  equal(store.all('user').get('content.length'),0)
  equal(store.all('project').get('content.length'),0)

  deepEqual(FactoryGuy.modelIds, {});
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


test("#makeFixture builds and pushes fixture into the store", function() {
  var json = store.makeFixture('user');
  equal(User.FIXTURES.length, 1);
  equal(User.FIXTURES[0], json);
});


asyncTest("#makeFixture sets hasMany associations on fixtures", function() {
  var p1 = store.makeFixture('project');
  // second project not added on purpose to make sure only one is
  // assigned in hasMany
  store.makeFixture('project');
  var user = store.makeFixture('user', {projects: [p1.id]})

  store.find('user', 1).then ( function(user) {
    user.get('projects').then( function(projects) {
      equal(projects.get('length'), 1, "adds hasMany records");
      equal(projects.get('firstObject.user.id'), 1, "sets belongsTo record");
      start();
    })
  })
})

asyncTest("#createRecord adds belongsTo associations to hasMany array", function() {
  var user = store.makeFixture('user');

  store.find('user', user.id).then(function(user){

    var projectJson = {title:'project', user: user};

    store.createRecord('project', projectJson).save()
      .then( function() {
        equal(user.get('projects.length'), 1);
        start();
      });
  })
})
