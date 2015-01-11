var container;

module('DS.Store', {
  setup: function() {
    container = new Ember.Container();
  },
  teardown: function() {}
});


test("with DS.FixtureAdapter", function() {
  var store = createStore({adapter: DS.FixtureAdapter});
  equal(store.usingFixtureAdapter(), true );
});

test("when extending DS.FixtureAdapter", function() {
  var adapter = DS.FixtureAdapter.extend({});
  var store = createStore({adapter: adapter});
  equal(store.usingFixtureAdapter(), true );
});

test("with DS.RESTAdapter", function() {
  var store = createStore({adapter: DS.RESTAdapter});
  equal(store.usingFixtureAdapter(), false );
});

test("with DS.ActiveModelAdapter", function() {
  var store = createStore({adapter: DS.ActiveModelAdapter});
  equal(store.usingFixtureAdapter(), false );
});

var store, testHelper, testFixtureEquality;
module('DS.Store#pushPayload', {
  setup: function(){
    testHelper = TestHelper.setup(DS.FixtureAdapter);
    store = testHelper.getStore();
  },
  teardown: function() {
    Em.run(function() {
      testHelper.teardown();
    });
  }
});

testFixtureEquality = function(models, json, num){
  equal(models.get('length'), num, 'Expected ' + num + ' ' + models.type.typeKey + ' in the data store but got ' + models.get('length'));
  deepEqual(
    models.map(function(model){ return model.get('id') }).sort(),
    json.map(function(model){ return model.id; }).sort(),
    'Expected to have all ' + Ember.String.pluralize(models.type.typeKey) + ' created'
  );
}

asyncTest("no root", function() {
  var userJson = {
        id: '1',
        name: 'monkey'
      };

  store.pushPayload('user', userJson);
  store.find('user').then(function(users){
    equal(users.get('length'), 1, 'Expected one user in the data store');

    equal(users.get('firstObject.id'), userJson.id);
    equal(users.get('firstObject.name'), userJson.name);
    start();
  });
});

asyncTest("no root replace data", function(){
  var projectJson = {
    id: '1',
    title: 'monkey',
    user: null
  };
  var u = FactoryGuy.make('user', { id: '1', name: 'banana' });
  var p = FactoryGuy.make('project', { user: u.id});
  store.find('user');

  store.find('project').then(function(projects) {
    var project = projects.get('firstObject'),
        user = project.get('user');

    equal(user.get('name'), u.name, 'Expected user name to be equal');
    equal(user.get('id'), u.id, 'Expected user id to be equal');
    equal(project.get('title'), p.title, 'Expected project title to equal');

    store.pushPayload('project', projectJson);

    ok(Ember.isEmpty(project.get('user')), 'Did not expect a user on project');
    equal(project.get('title'), projectJson.title, 'Expected project title to equal');
    start();
  });
});

asyncTest("single root", function() {
  var userJson = {
    users: [{ id:'1', name:'monkey' }, { id:'2', name:'banana' }]
  };

  store.pushPayload(userJson);
  store.find('user').then(function(users) {

    testFixtureEquality(users, userJson['users'], 2);

    users.forEach(function(user) {
      var u = userJson['users'].findBy('id', user.get('id'));
      equal(user.get('name'), u.name, 'Got unexpected name ' + user.get('name'));
    });

    start();
  });
});

asyncTest("multiple roots", function() {
  var json = {
    companies: [{ id: '1', name: 'Google', projects: ['1', '2'] }],
    projects: [
      { id:'1', title: 'Docs', user: '1' },
      { id:'2', title: 'Gmail' }
    ],
    users: [{ id: '1', name: 'monkey', projects: ['1'] }],
    profiles: [
      { id: '1', created_at: new Date(), description: 'banana' },
      { id: '2', created_at: new Date(), description: 'monkey' }
    ],
    hats: [
      { id: '2', type: 'Trilby' }
    ],
  };

  store.pushPayload(json);
  Ember.RSVP.Promise.all([
    store.find('company'), store.find('project'),
    store.find('user'), store.find('profile'), store.find('hat')
  ]).then(function(data) {
    var companies = data[0],
        projects = data[1],
        users = data[2],
        profiles = data[3],
        hats = data[4];

    testFixtureEquality(companies, json['companies'], 1);
    testFixtureEquality(projects, json['projects'], 2);
    testFixtureEquality(users, json['users'], 1);
    testFixtureEquality(profiles, json['profiles'], 2);
    testFixtureEquality(hats, json['hats'], 1);

    start();
  });
});

asyncTest("multiple roots with type specified", function() {
  var json = {
    companies: [{ id: '1', name: 'Google', projects: ['1', '2'] }],
    projects: [
      { id:'1', title: 'Docs', user: '1' },
      { id:'2', title: 'Gmail' }
    ],
    users: [{ id: '1', name: 'monkey', projects: ['1'] }],
  }

  store.pushPayload('company', json);

  Ember.RSVP.Promise.all([
    store.find('company'), store.find('project'), store.find('user')
  ]).then(function(data) {
    var companies = data[0],
        projects = data[1],
        users = data[2];

    testFixtureEquality(companies, json['companies'], 1);
    testFixtureEquality(projects, json['projects'], 2);
    testFixtureEquality(users, json['users'], 1);

    start();
  });
});

test('testing for exceptions', function(){
  throws(function() { store.pushPayload('user'); }, Ember.Error, 'Excepted to raise Ember.Error');
  throws(function() { store.pushPayload('user', { name: 'foo' }); }, Ember.Error, 'Excepted to raise Ember.Error');
  throws(function() { store.pushPayload({ someCrazyModelNotPresent: { id: 1, name: 'foo' } }); }, 'Excepted exception');
  throws(function() { store.pushPayload('someCrazyModelNotPresent', { id: 1, name: 'foo' }); }, 'Excepted exception');

  //no exceptions
  var noExceptions = true
  try {
    store.pushPayload('user', {});
    store.pushPayload({});
  } catch(error) {
    noExceptions = false;
  }

  ok(noExceptions, 'Should not raise exceptions');
});

asyncTest("replacing record", function() {
  var json = {
    companies: [{ id: '1', name: 'Google', projects: ['2', '3'] }],
    projects: [
      { id:'2', title: 'Docs', user: '1' },
      { id:'3', title: 'Gmail' }
    ],
    users: [{ id: '1', name: 'monkey', projects: ['2'] }],
    profiles: [
      { id: '1', created_at: new Date(), description: 'banana' },
      { id: '2', created_at: new Date(), description: 'monkey' }
    ],
    hats: [
      { id: '2', type: 'Trilby' }
    ],
  };

  var p = FactoryGuy.make('project');
  FactoryGuy.make('user', { id: '1', name: 'banana', projects: [ p.id ] });
  store.find('project');

  store.find('user').then(function(user) {
    equal(user.get('firstObject.projects.length'), 1, 'Expected one project');
    equal(user.get('firstObject.projects.firstObject.id'), '1', 'Expected project with id 1');

    store.pushPayload(json);

    equal(user.get('firstObject.projects.length'), 1, 'Expected one project');
    equal(user.get('firstObject.projects.firstObject.id'), '2', 'Expected project with id 2');

    start();
  });
});
