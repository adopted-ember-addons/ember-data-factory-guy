import Ember from 'ember';
import FactoryGuy, { build, buildList, make, makeList, mockFind, mockFindAll } from 'ember-data-factory-guy';

import SharedAdapterBehavior from './shared-adapter-tests';
import SharedFactoryGuyTestHelperBehavior from './shared-factory-guy-test-helper-tests';
import { title, inlineSetup } from '../helpers/utility-methods';

let App = null;
let adapter = 'DS.RESTAdapter/JSONSerializer';
let serializerType = '-json';

SharedAdapterBehavior.all(adapter, serializerType);

SharedFactoryGuyTestHelperBehavior.mockFindEmbeddedTests(App, adapter, serializerType);
SharedFactoryGuyTestHelperBehavior.mockFindAllEmbeddedTests(App, adapter, serializerType);

SharedFactoryGuyTestHelperBehavior.mockUpdateWithErrorMessages(App, adapter, serializerType);

module(title(adapter, 'FactoryGuy#build get'), inlineSetup(App, serializerType));

test("returns all attributes with no key", function() {
  let user = build('user');
  deepEqual(user.get(), { id: 1, name: 'User1', style: "normal" });
  equal(user.get().id, 1);
  equal(user.get().name, 'User1');
});

test("returns an attribute with a key", function() {
  let user = build('user');
  equal(user.get('id'), 1);
  equal(user.get('name'), 'User1');
});

module(title(adapter, 'FactoryGuy#buildList get'), inlineSetup(App, serializerType));

test("returns array of all attributes with no key", function() {
  let users = buildList('user', 2);
  deepEqual(users.get(), [{ id: 1, name: 'User1', style: "normal" }, { id: 2, name: 'User2', style: "normal" }]);
});

test("returns an attribute with a key", function() {
  let users = buildList('user', 2);
  deepEqual(users.get(0), { id: 1, name: 'User1', style: "normal" });
  equal(users.get(0).id, 1);
  deepEqual(users.get(1), { id: 2, name: 'User2', style: "normal" });
  equal(users.get(1).name, 'User2');
});

module(title(adapter, 'FactoryGuy#build custom'), inlineSetup(App, serializerType));

test("belongsTo ( not polymorphic ) record as id", function() {
  let company = build('company');
  let buildJson = build('property', { company });
  buildJson.unwrap();

  let expectedJson = {
    id: 1,
    name: 'Silly property',
    company: 1
  };

  deepEqual(buildJson, expectedJson);
});

test("hasMany ( not polymorphic ) records as ids", function() {
  let owners = buildList('user', 2);
  let buildJson = build('property', { owners });
  buildJson.unwrap();

  let expectedJson = {
    id: 1,
    name: 'Silly property',
    owners: [1, 2]
  };

  deepEqual(buildJson, expectedJson);
});

test("embeds belongsTo record when serializer attrs => embedded: always ", function() {

  let buildJson = build('comic-book', 'marvel');
  buildJson.unwrap();

  let expectedJson = {
    id: 1,
    name: 'Comic Times #1',
    company: { id: 1, type: 'Company', name: 'Marvel Comics' }
  };

  deepEqual(buildJson, expectedJson);
});

test("embeds belongsTo record passed as prebuilt ( build ) json when serializer attrs => embedded: always ", function() {
  let marvel = build('marvel');
  let buildJson = build('comic-book', { company: marvel });
  buildJson.unwrap();

  let expectedJson = {
    id: 1,
    name: 'Comic Times #1',
    company: { id: 1, type: 'Company', name: 'Marvel Comics' }
  };

  deepEqual(buildJson, expectedJson);
});

test("embeds hasMany records when serializer attrs => embedded: always", function() {

  let buildJson = build('comic-book', 'with_bad_guys');
  buildJson.unwrap();

  let expectedJson = {
    id: 1,
    name: 'Comic Times #1',
    characters: [
      { id: 1, type: 'Villain', name: 'BadGuy#1' },
      { id: 2, type: 'Villain', name: 'BadGuy#2' }
    ]
  };

  deepEqual(buildJson, expectedJson);
});

test("embeds hasMany records passed as prebuilt ( buildList ) json when serializer attrs => embedded: always", function() {
  let badGuys = buildList('villain', 2);
  let buildJson = build('comic-book', { characters: badGuys });
  buildJson.unwrap();

  let expectedJson = {
    id: 1,
    name: 'Comic Times #1',
    characters: [
      { id: 1, type: 'Villain', name: 'BadGuy#1' },
      { id: 2, type: 'Villain', name: 'BadGuy#2' }
    ]
  };

  deepEqual(buildJson, expectedJson);
});

test("embeds belongsTo record when serializer attrs => deserialize: 'records' ", function() {

  let buildJson = build('manager', 'with_salary');
  buildJson.unwrap();

  let expectedJson = {
    id: 1,
    name: {
      firstName: "Tyrion",
      id: 1,
      lastName: "Lannister"
    },
    salary: {
      id: 1,
      income: 90000,
      benefits: ['health', 'company car', 'dental']
    }
  };

  deepEqual(buildJson, expectedJson);
});

test("embeds belongsTo record passed as prebuilt ( build ) json when serializer attrs => deserialize: 'records' ", function() {
  let salary = build('salary');
  let buildJson = build('manager', { salary: salary });
  buildJson.unwrap();

  let expectedJson = {
    id: 1,
    name: {
      firstName: "Tyrion",
      id: 1,
      lastName: "Lannister"
    },
    salary: {
      id: 1,
      income: 90000,
      benefits: ['health', 'company car', 'dental']
    }
  };

  deepEqual(buildJson, expectedJson);
});

test("embeds hasMany records when serializer attrs => deserialize: 'records'", function() {

  let buildJson = build('manager', 'with_reviews');
  buildJson.unwrap();

  let expectedJson = {
    id: 1,
    name: {
      firstName: "Tyrion",
      id: 1,
      lastName: "Lannister"
    },
    reviews: [
      {
        id: 1,
        rating: 1,
        date: "2015-05-01T00:00:00.000Z"
      },
      {
        id: 2,
        rating: 2,
        date: "2015-05-01T00:00:00.000Z"
      }
    ]
  };

  deepEqual(buildJson, expectedJson);
});

test("embeds hasMany records passed as prebuilt ( buildList ) json when serializer attrs => deserialize: 'records'", function() {
  let reviews = buildList('review', 2);
  let buildJson = build('manager', { reviews: reviews });
  buildJson.unwrap();

  let expectedJson = {
    id: 1,
    name: {
      firstName: "Tyrion",
      id: 1,
      lastName: "Lannister"
    },
    reviews: [
      {
        id: 1,
        rating: 1,
        date: "2015-05-01T00:00:00.000Z"
      },
      {
        id: 2,
        rating: 2,
        date: "2015-05-01T00:00:00.000Z"
      }
    ]
  };

  deepEqual(buildJson, expectedJson);
});

// the override for primaryKey is in the helpers/utilityMethods.js
test("serializer primaryKey override", function() {
  let json = build('cat');
  equal(json.get('catId'), 1);
  equal(json.get('id'), 1);
});


test("serializes attributes with custom type", function() {
  let info = { first: 1 };
  let buildJson = build('user', { info: info });
  buildJson.unwrap();

  let expectedJson = {
    id: 1,
    name: 'User1',
    style: "normal",
    info: '{"first":1}'
  };

  deepEqual(buildJson, expectedJson);
});


//module(title(adapter, 'mockFind'), inlineSetup(App, serializerType));
//
//test("the basic returns id", function(assert) {
//    Ember.run(()=> {
//      let done = assert.async();
//      let profile = mockFind('profile');
//      console.log('test profile',profile.get());
//      let profileId = profile.get('id');
//
//      FactoryGuy.store.find('profile', profileId).then(function(profile) {
//        equal(profile.get('id'), profileId);
//        equal(profile.get('description'), 'Text goes here');
//        done();
//      });
//    });
//  });
