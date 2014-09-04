var testHelper, store;

module('FactoryGuy with DS.FixtureAdapter', {
  setup: function () {
    testHelper = TestHelper.setup(DS.FixtureAdapter);
    store = testHelper.getStore();
  },
  teardown: function () {
    Em.run(function () {
      testHelper.teardown();
    });
  }
});


test("#pushFixture adds fixture to Fixture array on model", function () {
  var fixtureJson = FactoryGuy.build('user');
  FactoryGuy.pushFixture(User, fixtureJson);
  equal(User.FIXTURES.length, 1);

  var fixtureJson2 = FactoryGuy.build('user');
  FactoryGuy.pushFixture(User, fixtureJson2);
  equal(User.FIXTURES.length, 2);
});


asyncTest("can change fixture attributes after creation", function () {
  var user = store.makeFixture('user');
  user.name = "new name";

  store.find('user', 1).then(function (user) {
    equal(user.get('name'), "new name", "changes local attributes");
    start();
  });
});


test("#resetModels clears the store of models, clears the FIXTURES arrays for each model and resets the model definition", function () {
  var project = store.makeFixture('project');
  var user = store.makeFixture('user', {projects: [project.id]});

  for (model in FactoryGuy.modelDefinitions) {
    var definition = FactoryGuy.modelDefinitions[model];
    sinon.spy(definition, 'reset');
  }

  FactoryGuy.resetModels(store);

  equal(User.FIXTURES.length, 0);
  equal(Project.FIXTURES.length, 0);

  equal(store.all('user').get('content.length'), 0)
  equal(store.all('project').get('content.length'), 0)

  for (model in FactoryGuy.modelDefinitions) {
    var definition = FactoryGuy.modelDefinitions[model];
    ok(definition.reset.calledOnce);
    definition.reset.restore();
  }
});


module('DS.Store with DS.FixtureAdapter', {
  setup: function () {
    testHelper = TestHelper.setup(DS.FixtureAdapter);
    store = testHelper.getStore();
  },
  teardown: function () {
    Em.run(function () {
      testHelper.teardown();
    });
  }
});


test("#makeFixture builds and pushes fixture into the models FIXTURE array", function () {
  var json = store.makeFixture('user');
  equal(User.FIXTURES.length, 1);
  equal(User.FIXTURES[0], json);
});


asyncTest("#makeFixture sets belongsTo on hasMany associations", function () {
  var p1 = store.makeFixture('project');
  // second project not added on purpose to make sure only one is
  // assigned in hasMany
  store.makeFixture('project');
  var user = store.makeFixture('user', {projects: [p1.id]})

  store.find('user', 1).then(function (user) {
    user.get('projects').then(function (projects) {
      equal(projects.get('length'), 1, "adds hasMany records");
      equal(projects.get('firstObject.user.id'), user.id, "sets belongsTo record");
      start();
    })
  })
})


asyncTest("#makeFixture adds record to hasMany association array for which it belongsTo", function () {
  var userJson = store.makeFixture('user');
  var projectJson = store.makeFixture('project', {user: userJson.id});

  store.find('user', userJson.id).then(function (user) {
    user.get('projects').then(function (projects) {
      equal(projects.get('length'), 1, "adds hasMany records");
      equal(projects.get('firstObject.user.id'), user.id, "sets belongsTo record");
      start();
    })
  })
})

asyncTest("#makeFixture handles default belongsTo associations in fixture", function () {
  var projectWithUser = store.makeFixture('project_with_user');
  equal(User.FIXTURES.length, 1);

  store.find('user', 1).then(function (user) {
    user.get('projects').then(function (projects) {
      equal(projects.get('length'), 1, "adds hasMany records");
      equal(projects.get('firstObject.user.id'), 1, "sets belongsTo record");
      start();
    })
  })
  // TODO.. have to make belongsTo async for fixture adapter
  // to get this to work
//  store.find('project', projectWithUser.id).then( function(project) {
//    console.log('a',project+'', project.id)
//    console.log('b',project.get('user')+'', project.get('user').toJSON())
//    project.get('user').then( function(user) {
//      console.log('c',user.toJSON())
//    })
//    start();
//  })
})


asyncTest("#createRecord adds belongsTo association to records it hasMany of", function () {
  var user = store.makeFixture('user');

  store.find('user', user.id).then(function (user) {

    var projectJson = {title: 'project', user: user};

    store.createRecord('project', projectJson).save()
      .then(function (project) {
        return Ember.RSVP.all([project.get('user'), user.get('projects')]);
      }).then(function (promises) {
        var projectUser = promises[0], projects = promises[1];
        equal(projectUser.get('id'), user.get('id'));
        equal(projects.get('length'), 1);
        start();
      });
  })
})

asyncTest("#createRecord can work for one-to-none associations", function () {
  var user = store.makeFixture('user');

  store.find('user', user.id).then(function (user) {

    var smallCompanyJson = {name: 'small company', owner: user};

    store.createRecord('small_company', smallCompanyJson).save()
      .then(function (smallCompany) {
        return smallCompany.get('owner');
      }).then(function (owner) {
        equal(owner.get('id'), user.get('id'));
        start();
      });
  })
})

asyncTest("#createRecord adds hasMany association to records it hasMany of ", function () {
  var usersJson = store.makeList('user', 3);

  var user1Promise = store.find('user', usersJson[0].id)
  var user2Promise = store.find('user', usersJson[1].id)
  var user3Promise = store.find('user', usersJson[2].id)
  Em.RSVP.all([user1Promise, user2Promise, user3Promise]).then(function (users) {

    var propertyJson = {name: 'beach front property'};

    var property = store.createRecord('property', propertyJson);
    property.get('owners').then(function (owners) {
      owners.addObjects(users);
      return property.save();
    }).then(function (property) {
      return property.get('owners');
    }).then(function (users) {
      equal(users.get('length'), usersJson.length);
      start();
    });
  })
})
