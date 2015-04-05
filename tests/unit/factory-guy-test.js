import Ember from 'ember';
import FactoryGuy, { make, makeList, build, buildList, clearStore } from 'ember-data-factory-guy';
import MissingSequenceError from 'ember-data-factory-guy/missing-sequence-error';

import { theUsualSetup, theUsualTeardown } from '../helpers/utility-methods';

import User from 'dummy/models/user';

var App;

module('FactoryGuy', {
  setup: function() {
    App = theUsualSetup();
  },
  teardown: function() {
    theUsualTeardown(App);
  }
});

test("has store set in initializer", function() {
  ok(FactoryGuy.getStore() instanceof DS.Store);
});

test("#make returns a model instance", function() {
  var user = FactoryGuy.make('user');
  ok(user instanceof User);
});

test("exposes make method which is shortcut for FactoryGuy.make", function() {
  ok(make('user') instanceof User);
});

test("#makeList returns an array of model instances", function() {
  var users = FactoryGuy.makeList('user',2);
  deepEqual(FactoryGuy.getStore().all('user').get('content'), users);
});

test("exposes makeList method which is shortcut for FactoryGuy.makeList", function() {
  var users = makeList('user',2);
  deepEqual(FactoryGuy.getStore().all('user').get('content'), users);
});

test("exposes build method which is shortcut for FactoryGuy.build", function() {
  var json = build('user');
  deepEqual(json, {id: 1, name: 'User1'});
});

test("exposes buildList method which is shortcut for FactoryGuy.buildList", function() {
  var userList = FactoryGuy.buildList('user', 2);
  deepEqual(userList[0], {id: 1, name: 'User1'});
  deepEqual(userList[1], {id: 2, name: 'User2'});
});

test("exposes clearStore method which is a shortcut for FactoryGuy.clearStore", function() {
  Ember.run( function() {
    makeList('user',2);
    clearStore();
    equal(FactoryGuy.getStore().all('user').get('content.length'), 0);
  });
});


test("Using sequences in definitions", function() {
  delete FactoryGuy.modelDefinitions['person'];

  FactoryGuy.define('person', {
    sequences: {
      personName: function(num) {
        return 'person #' + num;
      },
      personType: function(num) {
        return 'person type #' + num;
      }
    },
    default: {
      type: 'normal',
      name: FactoryGuy.generate('personName')
    },
    dude: {
      type: FactoryGuy.generate('personType')
    },
    bro: {
      type: FactoryGuy.generate('broType')
    },
    dude_inline: {
      type: FactoryGuy.generate(function(num) { return 'Dude #' + num;})
    }
  });

  var json = FactoryGuy.build('person');
  deepEqual(json, {id: 1, name: 'person #1', type: 'normal'}, 'in default attributes');

  json = FactoryGuy.build('dude');
  deepEqual(json, {id: 2, name: 'person #2', type: 'person type #1'}, 'in named attributes');

  throws( function() {
      FactoryGuy.build('bro');
    },
      MissingSequenceError,
    "throws error when sequence name not found"
  );

  json = FactoryGuy.build('dude_inline');
  deepEqual(json, {id: 3, name: 'person #3', type: 'Dude #1'}, 'as inline sequence function #1');

  json = FactoryGuy.build('dude_inline');
  deepEqual(json, {id: 4, name: 'person #4', type: 'Dude #2'}, 'as inline sequence function #2');
});


test("Referring to other attributes in attribute definition", function() {
  delete FactoryGuy.modelDefinitions['person'];

  FactoryGuy.define('person', {
    default: {
      name: 'Bob',
      type: 'normal'
    },
    funny_person: {
      type: function(f) { return 'funny ' + f.name; }
    },
    missing_person: {
      type: function(f) { return 'level ' + f.brain_size; }
    }
  });

  var json = FactoryGuy.build('funny_person');
  deepEqual(json, {id: 1, name: 'Bob', type: 'funny Bob'}, 'works when attribute exists');

  json = FactoryGuy.build('missing_person');
  deepEqual(json, {id: 2, name: 'Bob', type: 'level undefined'}, 'still works when attribute does not exists');
});


test("Using belongsTo associations in attribute definition", function() {
  var json = FactoryGuy.build('project_with_user');
  deepEqual(json, {id: 1, title: 'Project1', user: {id: 1, name: 'User1'}}, 'creates default association');

  json = FactoryGuy.build('project_with_dude');
  deepEqual(json, {id: 2, title: 'Project2', user: {id: 2, name: 'Dude'}}, 'creates association with optional attributes');

  json = FactoryGuy.build('project_with_admin');
  deepEqual(json, {id: 3, title: 'Project3', user: {id: 3, name: 'Admin'}}, 'creates association using named attribute');

  json = FactoryGuy.build('project_with_parent');
  deepEqual(json, {id: 5, title: 'Project4', parent: {id: 4, title: 'Project5'}}, 'belongsTo association name differs from model name');
});


test("Using hasMany associations in attribute definition", function() {
  var json = FactoryGuy.build('user_with_projects');
  deepEqual(json, {
    id: 1,
    name: 'User1',
    projects: [{id: 1, title: 'Project1'},{id: 2, title: 'Project2'}]
  }, 'creates list of hasMany association items');
});


test("#build with traits", function() {
  var json = FactoryGuy.build('project', 'big');
  deepEqual(json, {id: 1, title: 'Big Project'}, 'trait with model attributes');

  json = FactoryGuy.build('project', 'with_user');
  deepEqual(json, {id: 2, title: 'Project1', user: {id: 1, name: 'User1'}}, 'trait with belongsTo attributes');

  json = FactoryGuy.build('project', 'big', 'with_user');
  deepEqual(json, {id: 3, title: 'Big Project', user: {id: 2, name: 'User2'}}, 'more than one trait used together');

  json = FactoryGuy.build('project', 'big', 'with_user', {title: 'Crazy Project'});
  deepEqual(json, {id: 4, title: 'Crazy Project', user: {id: 3, name: 'User3'}}, 'more than one trait used together with custom attributes');

  json = FactoryGuy.build('project', 'big', 'with_dude');
  deepEqual(json, {id: 5, title: 'Big Project', user: {id: 4, name: 'Dude'}}, 'trait with custom belongsTo association object');

  json = FactoryGuy.build('project', 'with_admin');
  deepEqual(json, {id: 6, title: 'Project2', user: {id: 5, name: 'Admin'}}, 'trait with attribute using FactoryGuy.association method');

  json = FactoryGuy.build('project', 'with_title_sequence');
  deepEqual(json, {id: 7, title: 'Project3'}, 'trait with attribute using sequence');

  json = FactoryGuy.build('user', 'with_projects');
  deepEqual(json, {
    id: 6,
    name: 'User4',
    projects: [{id: 8, title: 'Project4'},{id: 9, title: 'Project5'}]
  }, 'trait with hasMany association');
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
  var json = FactoryGuy.build('admin');
  deepEqual(json, {id: 1, name: 'Admin'});
});


test("#build can override named model attributes", function() {
  var json = FactoryGuy.build('admin', {name: 'AdminGuy'});
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


test("#buildList creates list of fixtures", function() {
  var userList = FactoryGuy.buildList('user', 2);
  deepEqual(userList[0], {id: 1, name: 'User1'});
  deepEqual(userList[1], {id: 2, name: 'User2'});

  userList = FactoryGuy.buildList('user', 1, {name: 'Crazy'});
  deepEqual(userList[0], {id: 3, name: 'Crazy'},'using custom attributes');

  var projectList = FactoryGuy.buildList('project', 1, 'big');
  deepEqual(projectList[0], {id: 1, title: 'Big Project'}, 'using traits');

  projectList = FactoryGuy.buildList('project', 1, 'big', {title: 'Really Big'});
  deepEqual(projectList[0], {id: 2, title: 'Really Big'}, 'using traits and custom attributes');
});


test("#getAttributeRelationship", function() {
  var typeName = 'user';
  equal(FactoryGuy.getAttributeRelationship(typeName,'company').typeKey,'company');
  equal(FactoryGuy.getAttributeRelationship(typeName,'hats').typeKey,'hat');
  equal(FactoryGuy.getAttributeRelationship(typeName,'name'),null);
});










//test("#lookupDefinitionForFixtureName", function() {
//  equal(!!FactoryGuy.lookupDefinitionForFixtureName('person'), true, 'finds definition if its the same as model name');
//  equal(!!FactoryGuy.lookupDefinitionForFixtureName('funny_person'), true, 'finds definition if its a named fixture');
//  equal(!!FactoryGuy.lookupDefinitionForFixtureName('fake'), false, "return nothing if can't find definition");
//});
//
//test("#lookupModelForFixtureName", function() {
//  equal(FactoryGuy.lookupModelForFixtureName('person'), 'person', "finds model if its the same as model name");
//  equal(FactoryGuy.lookupModelForFixtureName('funny_person'), 'person', "finds model if it's definition has this named fixture");
//  equal(FactoryGuy.lookupModelForFixtureName('fake'), undefined, "return nothing if can't find definition");
//});
//


//module('FactoryGuy with DS.FixtureAdapter', {
//  setup: function() {
//    testHelper = TestHelper.setup(DS.FixtureAdapter);
//    store = testHelper.getStore();
//  },
//  teardown: function() {
//    Ember.run(function() {
//      testHelper.teardown();
//    });
//  }
//});
//
//
//asyncTest("#make loads the fixture in the store and returns an object", function() {
//  var user = FactoryGuy.make('user');
//  ok(user instanceof Object )
//  store.find('user', user.id).then(function(u){
//    ok(u instanceof User)
//    start()
//  })
//});
//
//
//asyncTest("#pushFixture", function() {
//  var User = store.modelFor('user'),
//      user = FactoryGuy.make('user'),
//      duplicateUser = FactoryGuy.build('user', { id: user.id, name: 'monkey' }),
//      differentUser = FactoryGuy.build('user'),
//      usersById = {};
//
//  usersById[duplicateUser.id] = duplicateUser;
//  usersById[differentUser.id] = differentUser;
//
//  FactoryGuy.pushFixture(User, duplicateUser);
//  FactoryGuy.pushFixture(User, differentUser);
//
//  store.find('user').then(function(users) {
//    ok(users.get('length') === 2);
//
//    users.forEach(function(user) {
//      equal(user.get('name'), usersById[user.get('id')].name, "Updates model fixture if duplicate id found");
//    });
//
//    start();
//  });
//});
